import { useState } from 'react'
import Badge from '../ui/Badge'
import Icon from '../ui/Icon'
import challenges from '../../data/challenges.json'

/* ── Severity config ────────────────────────────────────── */
const SEV = {
  P0: { color: '#ef4444', label: 'P0', glow: 'rgba(239,68,68,0.12)' },
  P1: { color: '#f97316', label: 'P1', glow: 'rgba(249,115,22,0.12)' },
  P2: { color: '#eab308', label: 'P2', glow: 'rgba(234,179,8,0.12)'  },
  P3: { color: '#3b82f6', label: 'P3', glow: 'rgba(59,130,246,0.12)' },
}

/* ── Inline SVG incident diagrams ───────────────────────── */
function IncidentVisual({ type, severity }) {
  const c = SEV[severity]?.color ?? '#f59e0b'

  if (type === 'database') return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
      {/* DB cylinder */}
      <ellipse cx="108" cy="28" rx="22" ry="9" stroke={c} strokeWidth="1.4" opacity=".55"/>
      <rect x="86" y="28" width="44" height="28" stroke={c} strokeWidth="1.4" opacity=".55"/>
      <ellipse cx="108" cy="56" rx="22" ry="9" stroke={c} strokeWidth="1.4" opacity=".55"/>
      <text x="95" y="45" fontSize="7" fill={c} opacity=".5" fontFamily="monospace">MAXED</text>
      {/* Pool connections – 7 dots trying to connect */}
      {[12, 22, 32, 42, 52, 62, 72].map((y, i) => (
        <g key={i}>
          <circle cx="12" cy={y} r="4" fill={c} opacity={i < 4 ? '.75' : '.18'}/>
          <line x1="16" y1={y} x2="86" y2="42"
            stroke={c} strokeWidth=".7" opacity={i < 4 ? '.35' : '.1'} strokeDasharray="4 3"/>
        </g>
      ))}
      {/* "BLOCKED" label for the overflow */}
      <text x="30" y="76" fontSize="6.5" fill={c} opacity=".4" fontFamily="monospace">+3 blocked</text>
    </svg>
  )

  if (type === 'lock') return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill={c} opacity=".8"/>
        </marker>
      </defs>
      {/* Lock body */}
      <rect x="54" y="42" width="32" height="26" rx="4" stroke={c} strokeWidth="1.4" opacity=".65"/>
      <path d="M61 42V33a9 9 0 0118 0v9" stroke={c} strokeWidth="1.4" opacity=".65"/>
      <circle cx="70" cy="55" r="3.5" fill={c} opacity=".65"/>
      {/* TXN1 wins */}
      <path d="M8 32 L52 50" stroke={c} strokeWidth="1.5" opacity=".75" markerEnd="url(#arr)"/>
      <text x="4" y="28" fontSize="7" fill={c} opacity=".65" fontFamily="monospace">TXN1</text>
      {/* TXN2 blocked */}
      <path d="M8 58 L52 55" stroke={c} strokeWidth="1.5" opacity=".3" strokeDasharray="4 3"/>
      <text x="4" y="66" fontSize="7" fill={c} opacity=".45" fontFamily="monospace">TXN2</text>
      <text x="88" y="36" fontSize="7" fill={c} opacity=".5" fontFamily="monospace">RACE!</text>
      {/* Corrupted data symbol */}
      <text x="86" y="72" fontSize="7" fill={c} opacity=".35" fontFamily="monospace">⚠ dirty read</text>
    </svg>
  )

  if (type === 'memory') return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
      {/* Memory container */}
      <rect x="25" y="8" width="55" height="70" rx="3" stroke={c} strokeWidth="1.4" opacity=".5"/>
      {/* Heap fill bars – growing over time */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="30" y={71 - (i+1)*10} width="45" height="9" rx="1"
          fill={c} opacity={.08 + i * .11}/>
      ))}
      {/* OOM warning at top */}
      <text x="28" y="22" fontSize="7" fill={c} opacity=".75" fontFamily="monospace">⚠ OOM</text>
      {/* Time axis labels */}
      {['0h','24h','48h','72h'].map((t, i) => (
        <text key={t} x={95} y={14 + i*20} fontSize="6" fill={c} opacity=".4" fontFamily="monospace">{t}</text>
      ))}
      {/* Growth arrow */}
      <path d="M85 75 L85 12" stroke={c} strokeWidth=".8" opacity=".4" strokeDasharray="3 2"/>
      <text x="92" y="80" fontSize="6" fill={c} opacity=".35" fontFamily="monospace">+200MB/hr</text>
    </svg>
  )

  if (type === 'query') return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
      {/* Origin request */}
      <rect x="4" y="35" width="26" height="18" rx="3" stroke={c} strokeWidth="1.4" opacity=".7"/>
      <text x="7" y="47" fontSize="6.5" fill={c} opacity=".7" fontFamily="monospace">REQ</text>
      {/* Exploding SQL queries */}
      {[8,18,28,38,50,62,72,82].map((y, i) => (
        <g key={i}>
          <line x1="30" y1="44" x2="64" y2={y}
            stroke={c} strokeWidth=".65" opacity=".35" strokeDasharray="3 2"/>
          <rect x="65" y={y-5} width="20" height="8" rx="1" stroke={c} strokeWidth=".75" opacity=".35"/>
          <text x="67" y={y+1} fontSize="5.5" fill={c} opacity=".4" fontFamily="monospace">SQL</text>
        </g>
      ))}
      {/* Big count */}
      <text x="90" y="44" fontSize="13" fill={c} opacity=".6" fontFamily="monospace" fontWeight="bold">×12K</text>
    </svg>
  )

  /* security / default */
  return (
    <svg viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-36">
      {/* CDN box */}
      <rect x="6" y="30" width="32" height="28" rx="3" stroke={c} strokeWidth="1.4" opacity=".7"/>
      <text x="10" y="48" fontSize="7" fill={c} opacity=".65" fontFamily="monospace">CDN</text>
      {/* Cache tag */}
      <text x="9" y="38" fontSize="5.5" fill={c} opacity=".45" fontFamily="monospace">CACHED</text>
      {/* Correct arrow to User A */}
      <path d="M38 38 L72 20" stroke={c} strokeWidth="1.5" opacity=".8"/>
      <rect x="74" y="12" width="28" height="16" rx="2" stroke={c} strokeWidth="1.4" opacity=".7"/>
      <text x="78" y="23" fontSize="6.5" fill={c} opacity=".65" fontFamily="monospace">UserA</text>
      {/* WRONG arrow to User B */}
      <path d="M38 52 L72 65" stroke={c} strokeWidth="1.5" opacity=".4" strokeDasharray="4 3"/>
      <rect x="74" y="58" width="28" height="16" rx="2" stroke={c} strokeWidth="1.4" opacity=".4"/>
      <text x="78" y="69" fontSize="6.5" fill={c} opacity=".4" fontFamily="monospace">UserB</text>
      <text x="104" y="46" fontSize="9" fill={c} opacity=".65">⚠</text>
      <text x="76" y="50" fontSize="5.5" fill={c} opacity=".35" fontFamily="monospace">DATA BLEED</text>
    </svg>
  )
}

/* ── Metric diff pill ───────────────────────────────────── */
function MetricPill({ label, before, after }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 truncate">{label}</span>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-mono text-[11px] text-zinc-500 line-through opacity-60">{before}</span>
        <span className="text-zinc-500 text-[10px]">→</span>
        <span className="font-mono text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">{after}</span>
      </div>
    </div>
  )
}

/* ── Individual challenge card ──────────────────────────── */
function ChallengeCard({ challenge, featured = false }) {
  const sev = SEV[challenge.severity] ?? SEV.P2

  return (
    <article
      className={`
        group relative flex flex-col
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
        rounded-lg overflow-hidden
        transition-all duration-300 hover:-translate-y-0.5
        ${featured ? 'lg:flex-row' : ''}
      `}
      style={{ '--glow': sev.glow }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 40px ${sev.glow}` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Severity stripe — full-height left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: sev.color }}
        aria-hidden="true"
      />

      {/* ── Card body ── */}
      <div className={`flex flex-col flex-1 p-5 pl-7 ${featured ? 'lg:w-3/5' : ''}`}>

        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Severity badge */}
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border font-semibold"
              style={{ color: sev.color, borderColor: `${sev.color}45`, backgroundColor: `${sev.color}12` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sev.color }} />
              {challenge.severity}
            </span>
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              {challenge.incidentId}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded bg-emerald-500/8">
              ✓ RESOLVED
            </span>
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              {challenge.timeToResolve}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors ${featured ? 'text-xl' : 'text-base'}`}
        >
          {challenge.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed mb-4">
          {challenge.summary}
        </p>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-md bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/60 mb-4">
          {challenge.metrics.map(m => (
            <MetricPill key={m.label} {...m} />
          ))}
        </div>

        {/* Root cause + resolution — monospace block */}
        <div className="space-y-2 mb-4 rounded-md bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/40 p-3">
          <div className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
            <span className="text-amber-500/70 shrink-0 mt-px">root_cause:</span>
            <span className="text-zinc-500 dark:text-zinc-500">{challenge.rootCause}</span>
          </div>
          <div className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
            <span className="text-emerald-500/70 shrink-0 mt-px">resolution:</span>
            <span className="text-zinc-500 dark:text-zinc-500">{challenge.resolution}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/60 mt-auto">
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-700">{challenge.date}</span>
          <span className="text-zinc-300 dark:text-zinc-800 text-xs" aria-hidden="true">·</span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
            {challenge.impactedUsers} affected
          </span>
          <div className="flex flex-wrap gap-1 ml-auto">
            {challenge.tech.slice(0, featured ? 5 : 3).map(t => (
              <Badge key={t} className="!text-[10px]">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Visual panel ── */}
      <div
        className={`
          flex items-center justify-center p-4
          bg-zinc-50 dark:bg-zinc-950/30
          border-zinc-200 dark:border-zinc-800
          ${featured
            ? 'border-t lg:border-t-0 lg:border-l lg:w-2/5 min-h-[160px]'
            : 'border-t h-32'
          }
        `}
        style={{ background: `linear-gradient(135deg, ${challenge.gradient[0]}12, ${challenge.gradient[1]}08)` }}
        aria-hidden="true"
      >
        <IncidentVisual type={challenge.visual} severity={challenge.severity} />
      </div>
    </article>
  )
}

/* ── Section ────────────────────────────────────────────── */
const INITIAL_GRID_COUNT = 2   // non-featured cards shown before "see all"

export default function Challenges() {
  const [showAll, setShowAll] = useState(false)
  const featured  = challenges.filter(c => c.featured)
  const rest      = challenges.filter(c => !c.featured)
  const visibleRest = showAll ? rest : rest.slice(0, INITIAL_GRID_COUNT)

  return (
    <section id="challenges" className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">

        {/* ── War-room header ── */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-5">
            <span className="font-mono text-xs text-amber-500">// 01 · war room</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-700 border border-zinc-300 dark:border-zinc-800 px-2 py-0.5 rounded">
              {challenges.length} incidents · all resolved
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Battle-Tested Solutions
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-500 max-w-xl leading-relaxed text-sm">
            Production fires I've owned end-to-end — diagnosed under pressure, resolved with precision,
            and converted into permanent improvements that made the system stronger.
          </p>

          {/* Live status strip */}
          <div className="mt-5 inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-2 bg-white dark:bg-zinc-900/60">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-800" aria-hidden="true">|</span>
            <span className="text-zinc-400 dark:text-zinc-600">MTTR avg: 3.4 hrs</span>
          </div>
        </div>

        {/* ── Featured P0 cards ── */}
        <div className="space-y-4 mb-4">
          {featured.map(c => (
            <ChallengeCard key={c.id} challenge={c} featured />
          ))}
        </div>

        {/* ── P1/P2/P3 grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleRest.map(c => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>

        {/* ── See all toggle ── */}
        {rest.length > INITIAL_GRID_COUNT && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(v => !v)}
              aria-expanded={showAll}
              className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 border border-zinc-300 dark:border-zinc-800 hover:border-amber-500/40 px-5 py-2.5 rounded-lg transition-all duration-200"
            >
              <Icon name={showAll ? 'chevronUp' : 'chevronDown'} className="w-3.5 h-3.5" />
              {showAll ? 'Show less' : `+ ${rest.length - INITIAL_GRID_COUNT} more incidents`}
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
