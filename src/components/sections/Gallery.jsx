import gallery from '../../data/gallery.json'

const TAG_COLORS = {
  speaking:  'text-amber-400',
  outdoors:  'text-emerald-400',
  workspace: 'text-zinc-400',
  travel:    'text-sky-400',
  team:      'text-violet-400',
  community: 'text-teal-400',
  fitness:   'text-orange-400',
  life:      'text-pink-400',
  work:      'text-blue-400',
  code:      'text-amber-500',
}

function PhotoCard({ photo, tall = false }) {
  const height = tall ? 'h-52' : 'h-40'

  return (
    <div className={`group relative shrink-0 w-56 ${height} rounded-xl overflow-hidden cursor-pointer`}>

      {/* Photo or gradient placeholder */}
      {photo.src
        ? <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
        : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(145deg, ${photo.colors[0]}, ${photo.colors[1]})` }}
            aria-label={photo.alt}
          />
        )
      }

      {/* Ambient grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}
        aria-hidden="true"
      />

      {/* Hover: amber tint + caption slide up */}
      <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/60 transition-all duration-300" aria-hidden="true" />

      <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 bg-linear-to-t from-zinc-950/95 to-transparent">
        <p className="text-xs font-medium text-zinc-100 leading-snug mb-0.5 truncate">
          {photo.caption}
        </p>
        <span className={`font-mono text-[10px] ${TAG_COLORS[photo.tag] ?? 'text-zinc-500'}`}>
          #{photo.tag}
        </span>
      </div>
    </div>
  )
}

function ScrollRow({ items, direction = 'left', tall = false }) {
  const doubled = [...items, ...items]
  const animClass = direction === 'left'
    ? '[animation:scroll-left_40s_linear_infinite]'
    : '[animation:scroll-right_36s_linear_infinite]'

  return (
    <div className="overflow-hidden group/row">
      <div className={`flex gap-3 w-max ${animClass} group-hover/row:[animation-play-state:paused]`}>
        {doubled.map((photo, i) => (
          <PhotoCard key={`${photo.id}-${i}`} photo={photo} tall={tall} />
        ))}
      </div>
    </div>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-xs text-amber-500">// 06 · life</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Beyond the Terminal
            </h2>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm leading-relaxed">
              Conference stages, mountain trails, and everything in between.
            </p>
          </div>

          <p className="font-mono text-xs text-zinc-700 shrink-0 pb-1">
            hover to pause
          </p>
        </div>
      </div>

      {/* Film strip rows */}
      <div className="space-y-3">
        {/* Row 1 — scrolls left, shorter cards */}
        <ScrollRow items={gallery.row1} direction="left"  tall={false} />

        {/* Row 2 — scrolls right, taller cards */}
        <ScrollRow items={gallery.row2} direction="right" tall={true}  />
      </div>

      {/* Bottom label */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <p className="font-mono text-[11px] text-zinc-800">
          // add your photos → /public/gallery/ · update src in data/gallery.json
        </p>
      </div>
    </section>
  )
}
