import Icon from '../ui/Icon'
import SectionHeader from '../ui/SectionHeader'
import profile from '../../data/profile.json'

const VALUES = [
  { title: 'Systems thinking',  body: 'I design for failure, think in tradeoffs, and sweat the details that most teams defer until production.' },
  { title: 'Code that lasts',   body: 'Clean interfaces, clear contracts, tests that make refactoring safe. Complexity is the enemy.' },
  { title: 'Shipping wins',     body: 'Perfect is shipped iteratively. I bias toward action, instrument everything, and let data drive decisions.' },
  { title: 'Raising the floor', body: "The best engineering orgs I've been in had a culture of rigorous review, shared ownership, and mentorship." },
]

function ProfilePhoto() {
  const { name, initials, photo, available } = profile

  return (
    <div className="flex flex-col items-center gap-5 mb-10 lg:mb-0">
      {/* Photo container */}
      <div className="relative w-40 h-40 shrink-0">
        {/* Outer glow ring */}
        <div
          className="absolute -inset-2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Border ring */}
        <div className="absolute -inset-0.5 rounded-full border-2 border-amber-500/40" aria-hidden="true" />

        {/* Photo / initials */}
        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 dark:bg-zinc-800 flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover object-top" loading="lazy" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)' }}
            >
              <span className="font-mono text-3xl font-bold text-zinc-600 select-none">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Availability dot */}
        {available && (
          <span
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500"
            title="Open to work"
            aria-label="Open to work"
          />
        )}
      </div>

      {/* Name + role tag */}
      <div className="text-center">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{name}</p>
        <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
          {profile.role.toLowerCase().replace(/ /g, '_')}
        </p>
      </div>
    </div>
  )
}

export default function About() {
  const { location, email } = profile

  return (
    <section id="about" className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-start">

          {/* Left: photo + narrative */}
          <div>
            <SectionHeader label="01 · about" title="Who I Am" />

            {/* Profile photo — visible on mobile/tablet here, desktop shows in Hero */}
            <div className="lg:hidden mb-8">
              <ProfilePhoto />
            </div>

            <div className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400 leading-loose">
              <p>
                I'm a software engineer who's been building systems people rely on for over eight years — from raw edge
                runtimes in C++ to consumer-facing React UIs, but my deepest work has been in the backend: distributed
                systems, data pipelines, and APIs at scale.
              </p>
              <p>
                I gravitate toward problems with hard constraints: latency budgets, consistency guarantees, failure modes
                at 10× traffic. I write code that fails gracefully, instruments itself, and lets the next engineer sleep
                through the weekend.
              </p>
              <p>
                Outside engineering, I write about what I learn, contribute to open source when I find a meaningful gap,
                and try to be the engineer I wish I'd had as a mentor early on.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-8 space-y-2.5">
              <div className="flex items-center gap-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-500">
                <Icon name="mapPin" className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                {location}
              </div>
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <Icon name="mail" className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                <a href={`mailto:${email}`} className="text-zinc-500 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Right: photo (desktop) + values */}
          <div>
            {/* Profile photo — desktop only, shown in right column of About */}
            <div className="hidden lg:block">
              <ProfilePhoto />
            </div>

            <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 mb-6">// principles</p>
            <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
              {VALUES.map(v => (
                <div key={v.title} className="py-5 group">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-1 h-4 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {v.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed pl-4">
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
