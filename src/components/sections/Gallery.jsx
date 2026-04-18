import { useState, useEffect, useRef, useCallback } from "react";
import gallery from "../../data/gallery.json";

// Lazy loaders — images are NOT downloaded until explicitly called
const assetLoaders = import.meta.glob("../../assets/gallery/*");

function getLoader(filename) {
  const key = Object.keys(assetLoaders).find(k => k.split("/").pop() === filename);
  return key ? assetLoaders[key] : null;
}

const TAG_COLORS = {
  speaking:  "text-amber-400",
  outdoors:  "text-emerald-400",
  workspace: "text-zinc-400",
  travel:    "text-sky-400",
  team:      "text-violet-400",
  community: "text-teal-400",
  fitness:   "text-orange-400",
  life:      "text-pink-400",
  work:      "text-blue-400",
  code:      "text-amber-500",
};

function PhotoCard({ photo, tall = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const height = tall ? "h-52" : "h-40";
  const hasSrc = Boolean(photo.resolvedSrc);

  return (
    <div className={`group relative shrink-0 w-56 ${height} rounded-xl overflow-hidden cursor-pointer`}>

      {/* Gradient placeholder — visible instantly, fades when image settles */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${imgLoaded ? "opacity-0" : "opacity-100"}`}
        style={{ background: `linear-gradient(145deg, ${photo.colors[0]}, ${photo.colors[1]})` }}
      >
        {/* Shimmer sweep — only while a real image is in flight */}
        {hasSrc && !imgLoaded && (
          <div
            className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"
          />
        )}
      </div>

      {/* Real image — crossfades in once loaded */}
      {hasSrc && (
        <img
          src={photo.resolvedSrc}
          alt={photo.alt}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
        />
      )}

      {/* Ambient grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
        aria-hidden="true"
      />

      {/* Hover tint + caption slide-up */}
      <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/60 transition-all duration-300" aria-hidden="true" />
      <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 bg-linear-to-t from-zinc-950/95 to-transparent">
        <p className="text-xs font-medium text-zinc-100 leading-snug mb-0.5 truncate">{photo.caption}</p>
        <span className={`font-mono text-[10px] ${TAG_COLORS[photo.tag] ?? "text-zinc-500"}`}>#{photo.tag}</span>
      </div>
    </div>
  );
}

function ScrollRow({ items, direction = "left", tall = false, animate = false }) {
  const doubled = [...items, ...items];
  const animDef = direction === "left"
    ? "scroll-left 40s linear infinite"
    : "scroll-right 36s linear infinite";

  return (
    <div className="overflow-hidden group/row">
      <div
        className={`flex gap-3 w-max group-hover/row:[animation-play-state:paused] will-change-transform transition-opacity duration-500 ${animate ? "opacity-100" : "opacity-0"}`}
        style={animate ? { animation: `${animDef}` } : undefined}
      >
        {doubled.map((photo, i) => (
          <PhotoCard key={`${photo.id}-${i}`} photo={photo} tall={tall} />
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  const sectionRef = useRef(null);
  const loadingRef = useRef(false);
  const [resolvedPhotos, setResolvedPhotos] = useState({
    row1: gallery.row1,
    row2: gallery.row2,
  });
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(false);

  const startLoading = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const allPhotos = [
      ...gallery.row1.map(p => ({ ...p, row: "row1" })),
      ...gallery.row2.map(p => ({ ...p, row: "row2" })),
    ].filter(p => p.src);

    let settled = 0;
    const threshold = Math.min(3, allPhotos.length);

    allPhotos.forEach(photo => {
      const loader = getLoader(photo.src);
      if (!loader) return;

      loader()
        .then(mod => {
          const resolvedSrc = mod.default;
          settled++;

          setResolvedPhotos(prev => {
            const row = photo.row;
            const idx = prev[row].findIndex(p => p.id === photo.id);
            if (idx === -1) return prev;
            const newRow = [...prev[row]];
            newRow[idx] = { ...newRow[idx], resolvedSrc };
            return { ...prev, [row]: newRow };
          });

          // Start scrolling only after a handful of images are ready
          if (settled === threshold) setAnimate(true);
        })
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          startLoading();
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startLoading]);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      {/* Header */}
      <div
        className="max-w-6xl mx-auto px-6 mb-12"
        style={visible ? { animation: "gallery-fade-in 0.6s ease forwards" } : { opacity: 0 }}
      >
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
          <p className="font-mono text-xs text-zinc-700 shrink-0 pb-1">hover to pause</p>
        </div>
      </div>

      {/* Film strip rows */}
      <div className="space-y-3">
        <ScrollRow items={resolvedPhotos.row1} direction="left"  tall={false} animate={animate} />
        <ScrollRow items={resolvedPhotos.row2} direction="right" tall={true}  animate={animate} />
      </div>
    </section>
  );
}
