import { useState, useEffect } from "react";

// ── Scroll-triggered at 20%
let _scrollReady = false;
let _callbacks = [];
let _listenerAttached = false;

function onScrollReady(cb) {
  if (_scrollReady) {
    cb();
    return;
  }
  _callbacks.push(cb);
  if (_listenerAttached || typeof window === "undefined") return;
  _listenerAttached = true;

  function check() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max <= 0 ? 1 : window.scrollY / max;
    if (pct >= 0.2) {
      _scrollReady = true;
      window.removeEventListener("scroll", check);
      const fns = _callbacks.splice(0);
      fns.forEach((fn) => fn());
    }
  }

  check(); // fire immediately if page already scrolled past 20%
  window.addEventListener("scroll", check, { passive: true });
}

// ── Singleton fetch
let _promise = null;
let _data = null;

function fetchData() {
  if (_data) return Promise.resolve(_data);
  if (!_promise) {
    _promise = fetch("/api/visitors")
      .then((r) => r.json())
      .then((d) => {
        console.log(d,'dd','raw is',d._d, 'raw total',d._d?.rawTotal, 'raw unique', d._d?.rawUnique, 'count', d.count);
        // Support both new { total, unique } and old { count } API shapes
        const rawTotal = d._d?.rawTotal ?? d._d ?? d.count ?? null;
        const rawUnique = d._d?.rawUnique ?? d._d ?? d.count ?? null;
        _data = {
          // old API only tracked unique (d.count) — can't derive total visits from it, use floor
          total: typeof d.total === "number" ? d.total : 620,
          unique: typeof d.unique === "number" ? d.unique : (typeof d.count === "number" ? d.count : 500),
        };
        console.log("[vc] ac → total:", rawTotal, "unique:", rawUnique,);
        return _data;
      })
      .catch(() => {
        _data = { total: 620, unique: 500 };
        return _data;
      });
  }
  return _promise;
}

// ── Count-up animation
function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

export function VisitorCounterHero() {
  const [data, setData] = useState(null);
  const totalAnim = useCountUp(data?.total ?? 0);
  const uniqueAnim = useCountUp(data?.unique ?? 0);

  // Ratio animates in sync with the count-up
  const liveRatio = totalAnim > 0 ? Math.round((uniqueAnim / totalAnim) * 100) : 0;

  useEffect(() => {
    onScrollReady(() => fetchData().then(setData));
  }, []);

  if (!data) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0 animate-pulse" />
          <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 tabular-nums">···</span>
        </div>
        <div className="font-mono text-xs text-zinc-300 dark:text-zinc-700 pl-3.5">visitors</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 select-none" role="status" aria-label={`${data.total.toLocaleString()} total visits, ${data.unique.toLocaleString()} unique`}>
      {/* Primary — total visits */}
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden="true" />
        <span className="text-2xl font-bold text-amber-400 tabular-nums" aria-live="polite">
          {totalAnim.toLocaleString()}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono self-end pb-0.5">visits</span>
      </div>

      {/* Secondary — unique + animated ratio bar */}
      <div className="pl-3.5 flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500 tabular-nums">{uniqueAnim.toLocaleString()} unique</span>
        <div className="relative w-10 h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden" title={`${liveRatio}% unique visitor rate`} aria-hidden="true">
          <div className="absolute inset-y-0 left-0 bg-amber-500/60 rounded-full" style={{ width: `${liveRatio}%`, transition: "width 50ms linear" }} />
        </div>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 tabular-nums">{liveRatio}%</span>
      </div>
    </div>
  );
}

/* ── Footer variant 
   Compact dual stat: N visits · M unique
*/
export function VisitorCounterFooter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    onScrollReady(() => fetchData().then(setData));
  }, []);

  if (!data) return null;

  return (
    <span className="font-mono text-[11px] text-amber-600/50 dark:text-amber-500/50">
      // {data.total.toLocaleString()}_visits · {data.unique.toLocaleString()}_unique
    </span>
  );
}
