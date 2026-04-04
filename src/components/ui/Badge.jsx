const variants = {
  default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
  amber:   'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  outline: 'border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-mono
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
