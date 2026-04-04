import Badge from '../ui/Badge'
import SectionHeader from '../ui/SectionHeader'
import Icon from '../ui/Icon'
import experience from '../../data/experience.json'

function ExperienceItem({ job, index }) {
  return (
    <div className="group grid md:grid-cols-[180px_1fr] gap-6 py-10 border-b border-zinc-200 dark:border-zinc-800/60 last:border-b-0">

      {/* Left: meta */}
      <div className="md:pt-1">
        <div className="font-mono text-xs text-amber-500/80 mb-1">{job.period}</div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-600">
          <Icon name="mapPin" className="w-3 h-3 shrink-0" />
          {job.location}
        </div>
        {job.current && (
          <span className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] text-amber-500 border border-amber-500/20 rounded px-1.5 py-0.5 bg-amber-500/5">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            current
          </span>
        )}
      </div>

      {/* Right: content */}
      <div>
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors leading-tight">
              {job.role}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">{job.company}</p>
          </div>
          {/* Index number — decorative */}
          <span className="ml-auto font-mono text-2xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Achievements */}
        <ul className="space-y-2.5 mb-5">
          {job.achievements.map((a, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-500 leading-relaxed">
              <span className="text-amber-500/50 font-mono text-xs mt-0.5 shrink-0">›</span>
              {a}
            </li>
          ))}
        </ul>

        {/* Tech */}
        <div className="flex flex-wrap gap-1.5">
          {job.tech.map(t => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="02 · career"
          title="Experience"
          description="A track record of building systems that scale and teams that thrive."
        />
        <div>
          {experience.map((job, i) => (
            <ExperienceItem key={job.id} job={job} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
