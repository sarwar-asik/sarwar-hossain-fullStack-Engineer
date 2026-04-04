export default function SectionHeader({ label, title, description }) {
  return (
    <div className="mb-14">
      {/* Mono label + ruled line */}
      {label && (
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-xs text-amber-500 whitespace-nowrap">
            // {label}
          </span>
          <div className="flex-1 h-px bg-zinc-800 dark:bg-zinc-800" />
        </div>
      )}

      <h2 className="text-4xl font-bold tracking-tight text-zinc-100 dark:text-zinc-100">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-zinc-500 dark:text-zinc-500 max-w-xl leading-relaxed text-sm">
          {description}
        </p>
      )}
    </div>
  )
}
