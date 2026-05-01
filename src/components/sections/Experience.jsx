import { useState } from "react";
import Badge from "../ui/Badge";
import SectionHeader from "../ui/SectionHeader";
import experience from "../../data/experience.json";

/* ── Date helpers ────────────────────────────────────────── */
const _M = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseMonthYear(str) {
  if (!str || str.trim() === "Present") return new Date();
  const [mon, yr] = str.trim().split(" ");
  return new Date(parseInt(yr), _M[mon] ?? 0, 1);
}

function fmtMonthYear(d) {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${M[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── Auto-generate section description from entries ─────── */
function buildSectionDescription(entries) {
  const parsed = [...entries]
    .map(e => { const [s] = e.period.split(" – "); return { ...e, startDate: parseMonthYear(s) }; })
    .sort((a, b) => a.startDate - b.startDate);

  const compOrder = [];
  const compMap = new Map();
  parsed.forEach(e => {
    if (!compMap.has(e.company)) { compOrder.push(e.company); compMap.set(e.company, []); }
    compMap.get(e.company).push(e);
  });

  const parts = [];
  compOrder.forEach((comp, idx) => {
    const roles = compMap.get(comp);
    const first = roles[0];
    const last = roles[roles.length - 1];
    const [, endStr] = last.period.split(" – ");
    const period = `${fmtMonthYear(first.startDate)} – ${endStr === "Present" ? "present" : endStr}`;

    if (idx === 0 && compOrder.length > 1) {
      parts.push(`${first.role} at ${comp} (${period})`);
    } else {
      parts.push(`then joined ${comp} in ${fmtMonthYear(first.startDate)}`);
      if (roles.length > 1) parts.push(`promoted to ${last.role} in ${fmtMonthYear(last.startDate)}`);
    }
  });

  if (parts.length <= 2) return parts.join(", ");
  return `${parts.slice(0, -1).join(", ")} — ${parts[parts.length - 1]}`;
}

/* ── Group flat entries by company ───────────────────────── */
function groupByCompany(entries) {
  const map = new Map();
  entries.forEach((job) => {
    if (!map.has(job.company)) {
      map.set(job.company, {
        company: job.company,
        location: job.location,
        url: job.url,
        color: job.color,
        monogram: job.monogram,
        concurrent: job.concurrent,
        current: false,
        roles: [],
      });
    }
    const co = map.get(job.company);
    co.current = co.current || job.current;
    co.roles.push(job);
  });
  // preserve insertion order (newest company first)
  return [...map.values()];
}

/* ── Role node inside the timeline ─────────────────────────
   top   = most recent (current) role → filled circle, amber
   below = older role → hollow circle, muted
   ────────────────────────────────────────────────────────── */
function RoleNode({ role, color, isTop, showPromotion, promotedFrom }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="relative">
      {/* Timeline node + role header ─────────────────────── */}
      <div className="flex items-start gap-4">
        {/* ── Column: circle + rail ── */}
        <div className="flex flex-col items-center shrink-0 w-5 mt-0.5">
          {isTop ? (
            /* Filled circle — current role */
            <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: color, backgroundColor: `${color}20` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            </span>
          ) : (
            /* Hollow circle — past role */
            <span className="w-5 h-5 rounded-full border-2 bg-white dark:bg-zinc-950 shrink-0" style={{ borderColor: `${color}60` }} />
          )}

          {/* Rail that connects down to next role or promotion banner */}
          {showPromotion && <div className="w-px flex-1 mt-2 min-h-[60px]" style={{ backgroundColor: `${color}30` }} />}
        </div>

        {/* ── Role content ── */}
        <div className="flex-1 pb-2">
          {/* Role header row */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <h3 className={`font-bold leading-tight ${isTop ? "text-zinc-900 dark:text-zinc-100 text-base" : "text-zinc-600 dark:text-zinc-400 text-sm"}`}>{role.role}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-xs" style={{ color: isTop ? color : `${color}80` }}>
                  {role.period}
                </span>
                {role.duration && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{role.duration}</span>
                  </>
                )}
              </div>
            </div>

            {/* Current badge or Past chip */}
            {role.current ? (
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[10px] border rounded px-2 py-0.5"
                style={{ color, borderColor: `${color}30`, backgroundColor: `${color}08` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                current
              </span>
            ) : (
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
              >
                {expanded ? "▾ collapse" : "▸ expand"}
              </button>
            )}
          </div>

          {/* Achievements */}
          {expanded && (
            <ul className="space-y-2 mb-3">
              {role.achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: isTop ? undefined : undefined }}>
                  <span className="shrink-0 mt-1 font-mono" style={{ color: `${color}60` }}>
                    ›
                  </span>
                  <span className={isTop ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}>{a}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tech stack */}
          {expanded && (
            <div className="flex flex-wrap gap-1.5">
              {role.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PROMOTED banner between roles ──────────────────────── */
function PromotionBanner({ color, fromRole, toRole }) {
  return (
    <div className="flex items-start gap-4 my-1">
      {/* Column — continues the rail */}
      <div className="flex flex-col items-center shrink-0 w-5">
        <div className="w-px flex-1 min-h-[44px]" style={{ backgroundColor: `${color}30` }} />
      </div>

      {/* Banner */}
      <div className="flex-1 flex items-center gap-3 rounded-lg px-4 py-2.5 border my-1" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
        {/* Up arrow */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: `${color}20`, color }}>
          ↑
        </div>
        <div>
          <p className="font-mono text-[11px] font-semibold" style={{ color }}>
            PROMOTED
          </p>
          <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 mt-px">
            {fromRole} → {toRole}
          </p>
        </div>

        {/* decorative chevrons */}
        <div className="ml-auto flex gap-1" aria-hidden="true">
          {[0.4, 0.6, 0.9].map((op, i) => (
            <span key={i} className="font-mono text-xs" style={{ color, opacity: op }}>
              ›
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Company card ─────────────────────────────────────────
   Groups all roles for one employer into a single card.
   If there are multiple roles → shows promotion timeline.
   ────────────────────────────────────────────────────────── */
function CompanyCard({ company }) {
  const { color, monogram, current, concurrent, roles } = company;
  const hasPromotion = roles.length > 1;

  // Derive total period: oldest start → newest end
  const totalPeriod = (() => {
    const starts = roles.map((r) => r.period.split(" – ")[0]);
    const ends = roles.map((r) => r.period.split(" – ")[1]);
    const start = starts[starts.length - 1]; // oldest entry is last (entries are newest-first)
    const end = ends[0]; // newest entry is first
    return `${start} – ${end}`;
  })();

  return (
    <div
      className="group relative rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ borderColor: `${color}25` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}25`;
      }}
    >
      {/* Left colour accent rail */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: color }} aria-hidden="true" />

      {/* ── Company header ─────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b ml-1" style={{ borderColor: `${color}15` }}>
        {/* Monogram badge */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0 select-none" style={{ backgroundColor: `${color}18`, color }}>
          {monogram}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">{company.company}</h2>
            {concurrent && (
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">// concurrent</span>
            )}
            {current && (
              <span
                className="inline-flex items-center gap-1 font-mono text-[10px] border rounded px-1.5 py-0.5"
                style={{ color, borderColor: `${color}30`, backgroundColor: `${color}08` }}
              >
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                active
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{totalPeriod}</span>
            <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{company.location}</span>
            {company.url && (
              <>
                <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700" aria-hidden="true">
                  ·
                </span>
                <a
                  href={`https://${company.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] hover:underline underline-offset-2"
                  style={{ color: `${color}90` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.url}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Role count chip */}
        {hasPromotion && (
          <div
            className="shrink-0 font-mono text-[10px] border rounded-full px-2.5 py-1 text-center hidden sm:block"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}08` }}
          >
            {roles.length} roles
          </div>
        )}
      </div>

      {/* ── Timeline body ──────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 ml-1 space-y-0">
        {roles.map((role, i) => {
          const isTop = i === 0;
          const showPromotion = hasPromotion && isTop;
          const nextRole = roles[i + 1];

          return (
            <div key={role.id}>
              <RoleNode role={role} color={color} isTop={isTop} showPromotion={showPromotion} />

              {/* Promotion banner between role[0] and role[1] */}
              {showPromotion && nextRole && <PromotionBanner color={color} fromRole={nextRole.role} toRole={role.role} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mini career Gantt (decorative top strip) ────────────── */
function CareerTimeline({ entries }) {
  const now = new Date();

  const parsed = entries.map(e => {
    const [s, en] = e.period.split(" – ");
    return { ...e, startDate: parseMonthYear(s), endDate: parseMonthYear(en) };
  });

  const minMs = Math.min(...parsed.map(e => e.startDate.getTime()));
  const maxMs = now.getTime();
  const range = maxMs - minMs;
  const toPct = d => Math.min(100, ((d.getTime() - minMs) / range) * 100);

  // Group by company, sort by earliest start
  const compMap = new Map();
  parsed.forEach(e => {
    if (!compMap.has(e.company)) compMap.set(e.company, []);
    compMap.get(e.company).push(e);
  });

  const bars = [...compMap.entries()]
    .map(([company, roles]) => ({
      label: company,
      startMs: Math.min(...roles.map(r => r.startDate.getTime())),
      endMs: Math.max(...roles.map(r => r.endDate.getTime())),
      isCurrent: roles.some(r => r.current),
      roles: roles.map(r => ({
        label: r.role,
        pct: [toPct(r.startDate), toPct(r.endDate)],
        color: r.color,
        past: !r.current,
      })),
    }))
    .sort((a, b) => a.startMs - b.startMs);

  // Labels: overall start + each subsequent company start + current role start
  const labelDates = [new Date(minMs)];
  bars.slice(1).forEach(b => labelDates.push(new Date(b.startMs)));
  const currentEntry = parsed.find(e => e.current);
  if (currentEntry) {
    const t = currentEntry.startDate.getTime();
    const dup = labelDates.some(d => Math.abs(d.getTime() - t) < 1000 * 60 * 60 * 24 * 45);
    if (!dup) labelDates.push(currentEntry.startDate);
  }

  // Separator tick at first company transition
  const separatorPct = bars.length > 1 ? toPct(new Date(bars[1].startMs)) : null;

  // Footer note
  const noteSpans = bars.map(b => {
    const start = fmtMonthYear(new Date(b.startMs));
    const end = b.isCurrent ? "present" : fmtMonthYear(new Date(b.endMs));
    return `${b.label} (${start} – ${end})`;
  });

  return (
    <div className="mb-12 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
      {/* Labels row */}
      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-700 mb-3">
        {labelDates.map((d, i) => (
          <span key={i}>{fmtMonthYear(d)}</span>
        ))}
        <span className="text-amber-500/70">Now</span>
      </div>

      {/* Separator tick at first company transition */}
      <div className="relative h-px bg-zinc-200 dark:bg-zinc-800 mb-4">
        {separatorPct !== null && (
          <div className="absolute top-0 bottom-0 w-px bg-zinc-400 dark:bg-zinc-600" style={{ left: `${separatorPct}%` }} aria-hidden="true" />
        )}
      </div>

      <div className="space-y-4">
        {bars.map(({ label, roles: rBars }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 w-32 shrink-0 truncate">{label}</span>
            <div className="relative flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              {rBars.map((b, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex items-center px-2 rounded-full"
                  style={{
                    left: `${b.pct[0]}%`,
                    width: `${b.pct[1] - b.pct[0]}%`,
                    backgroundColor: b.past ? `${b.color}40` : `${b.color}80`,
                    borderRight: i < rBars.length - 1 ? `1px solid ${b.color}` : "none",
                  }}
                >
                  <span className="font-mono text-[9px] text-white/80 truncate">{b.label}</span>
                </div>
              ))}
              <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
                <span className="font-mono text-[10px] text-amber-500/70">▶</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[10px] text-zinc-400 dark:text-zinc-700">
        {`// ${noteSpans.join(" → ")}`}
      </p>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */
export default function Experience() {
  const companies = groupByCompany(experience);

  return (
    <section id="experience" aria-label="Sarwar Hossain Work Experience" className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="02 · career"
          title="Experience"
          description={buildSectionDescription(experience)}
        />

        {/* Mini Gantt timeline */}
        <CareerTimeline entries={experience} />

        {/* Company cards */}
        <div className="space-y-6">
          {companies.map((co) => (
            <CompanyCard key={co.company} company={co} />
          ))}
        </div>
      </div>
    </section>
  );
}
