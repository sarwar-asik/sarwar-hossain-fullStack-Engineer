import SectionHeader from '../ui/SectionHeader'
import skills from '../../data/skills.json'

export default function Skills() {
  return (
    <section id="skills" aria-label="Sarwar Hossain | Sarwar Asik Technical Skills" className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          label="04 · toolkit"
          title="Skills"
          description="Grouped by domain — each chosen for a specific hard problem."
        />

        <div className="space-y-0 divide-y divide-zinc-800/60">
          {skills.map(group => (
            <div
              key={group.category}
              className="group grid md:grid-cols-[120px_1fr] lg:grid-cols-[160px_1fr] gap-2 md:gap-4 py-5 items-baseline hover:bg-zinc-900/30 -mx-2 px-2 sm:-mx-4 sm:px-4 transition-colors rounded-lg"
            >
              {/* Category */}
              <span className="font-mono text-xs text-amber-500/80 shrink-0">
                {group.category}
              </span>

              {/* Skills — plain text separated by · */}
              <p className="text-sm text-zinc-400 leading-relaxed">
                {group.items.map((item, i) => (
                  <span key={item}>
                    <span className="hover:text-amber-400 transition-colors cursor-default">
                      {item}
                    </span>
                    {i < group.items.length - 1 && (
                      <span className="text-zinc-700 mx-2" aria-hidden="true">·</span>
                    )}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        {/* Total count */}
        <div className="mt-10 pt-6 border-t border-zinc-800/60">
          <p className="font-mono text-xs text-zinc-700">
            {skills.reduce((n, g) => n + g.items.length, 0)} technologies across {skills.length} domains
          </p>
        </div>
      </div>
    </section>
  )
}
