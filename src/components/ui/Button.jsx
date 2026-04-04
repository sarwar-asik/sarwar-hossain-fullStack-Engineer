const variants = {
  primary: `
    bg-amber-500 text-zinc-950 font-semibold
    hover:bg-amber-400
    focus-visible:ring-amber-500
  `,
  outline: `
    border border-zinc-700 text-zinc-300 font-medium
    hover:border-amber-500/60 hover:text-amber-400
    focus-visible:ring-amber-500/50
    dark:border-zinc-700 dark:text-zinc-300
  `,
  ghost: `
    text-zinc-400 font-medium
    hover:text-amber-400 hover:bg-zinc-900
    focus-visible:ring-zinc-600
  `,
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2   gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...props
}) {
  const base = `
    inline-flex items-center justify-center rounded-lg
    transition-all duration-150
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
    disabled:opacity-40 disabled:pointer-events-none
    ${variants[variant]} ${sizes[size]} ${className}
  `
  if (href) return <a href={href} className={base} {...props}>{children}</a>
  return <button className={base} {...props}>{children}</button>
}
