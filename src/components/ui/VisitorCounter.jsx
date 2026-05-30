import { useState, useEffect } from "react";

// Module-level singleton — one fetch shared by all instances (Hero + Footer)
let _promise = null;
let _count = null;

function fetchCount() {
  if (_count !== null) return Promise.resolve(_count);
  if (!_promise) {
    _promise = fetch("/api/visitors")
      .then((r) => r.json())
      .then((d) => {
        _count = typeof d.count === "number" ? d.count : 500;
        console.log("[vc] raw:", d._d, "| d:", _count);
        return _count;
      })
      .catch(() => {
        _count = 500;
        return 500;
      });
  }
  return _promise;
}

function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ── Hero variant ── large live stat in stats row */
export function VisitorCounterHero() {
  const [count, setCount] = useState(null);
  const animated = useCountUp(count ?? 0);

  useEffect(() => {
    fetchCount().then(setCount);
  }, []);

  // Skeleton — keeps layout stable while fetching
  if (count === null) {
    return (
      <div aria-hidden="true">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
          <span className="text-2xl font-bold text-zinc-700">···</span>
        </div>
        <div className="font-mono text-xs text-zinc-700 mt-0.5 pl-3.5">visitors</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden="true" />
        <span className="text-2xl font-bold text-amber-400" aria-live="polite">
          {animated.toLocaleString()}
        </span>
      </div>
      <div className="font-mono text-xs text-zinc-600 mt-0.5 pl-3.5">visitors</div>
    </div>
  );
}

/* ── Footer variant ── minimal inline echo, light + dark mode safe */
export function VisitorCounterFooter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetchCount().then(setCount);
  }, []);

  if (count === null) return null;

  return <span className="font-mono text-[11px] text-amber-600/50 dark:text-amber-500/50">// {count.toLocaleString()}_unique_visitors</span>;
}
