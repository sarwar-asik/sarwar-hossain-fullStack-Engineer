import Icon from '../ui/Icon'
import profile from '../../data/profile.json'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
          {profile.initials}
        </span>

        <p className="font-mono text-[11px] text-zinc-700">
          © {new Date().getFullYear()} {profile.name}
        </p>

        <div className="flex items-center gap-1">
          {profile.social.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="w-8 h-8 flex items-center justify-center rounded text-zinc-700 hover:text-amber-400 transition-colors"
            >
              <Icon name={s.icon} className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
