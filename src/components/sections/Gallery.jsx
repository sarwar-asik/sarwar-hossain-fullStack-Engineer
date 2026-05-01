import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { createPortal } from "react-dom";
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

// ── Modal ─────────────────────────────────────────────────
function PhotoModal({ photo, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const closeRef = useRef(null);

  // Body scroll lock + auto-focus close button
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard navigation + focus trap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft"  && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
      // Basic focus trap: keep Tab inside modal
      if (e.key === "Tab") {
        const modal = document.getElementById("photo-modal");
        if (!modal) return;
        const focusable = modal.querySelectorAll('button,[tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-zinc-950/90 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        id="photo-modal"
        role="dialog"
        aria-modal="true"
        aria-label={photo.caption}
        className="relative w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl"
        style={{ animation: "modal-in 0.22s ease forwards", maxHeight: "90dvh" }}
        onClick={e => e.stopPropagation()}
        aria-hidden="false"
      >
        {/* Image area */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${photo.colors[0]}, ${photo.colors[1]})`, minHeight: 240 }}
        >
          {photo.resolvedSrc && (
            <img
              src={photo.resolvedSrc}
              alt={photo.alt}
              className={`w-full object-contain transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              style={{ maxHeight: "70dvh" }}
              onLoad={() => setImgLoaded(true)}
            />
          )}

          {/* Shimmer while loading */}
          {photo.resolvedSrc && !imgLoaded && (
            <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          )}

          {/* Close button — auto-focused on mount */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close photo preview"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-colors text-sm font-bold focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            ✕
          </button>

          {/* Prev arrow */}
          {hasPrev && (
            <button
              onClick={onPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-colors text-lg"
            >
              ‹
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              onClick={onNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-colors text-lg"
            >
              ›
            </button>
          )}
        </div>

        {/* Caption bar */}
        <div className="px-5 py-4 flex items-center justify-between gap-4 bg-zinc-900">
          <p className="text-sm font-medium text-zinc-100 truncate">{photo.caption}</p>
          <span className={`font-mono text-[11px] shrink-0 ${TAG_COLORS[photo.tag] ?? "text-zinc-500"}`}>
            #{photo.tag}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Photo Card ────────────────────────────────────────────
function PhotoCard({ photo, tall = false, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const height = tall ? "h-52" : "h-40";
  const hasSrc = Boolean(photo.resolvedSrc);

  return (
    <div
      className={`group relative shrink-0 w-56 ${height} rounded-xl overflow-hidden cursor-pointer`}
      onClick={() => onOpen(photo.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onOpen(photo.id)}
      aria-label={`View: ${photo.caption}`}
    >
      {/* Gradient placeholder */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${imgLoaded ? "opacity-0" : "opacity-100"}`}
        style={{ background: `linear-gradient(145deg, ${photo.colors[0]}, ${photo.colors[1]})` }}
      >
        {hasSrc && !imgLoaded && (
          <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
        )}
      </div>

      {/* Real image */}
      {hasSrc && (
        <img
          src={photo.resolvedSrc}
          alt={photo.alt}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
        />
      )}

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
        aria-hidden="true"
      />

      {/* Hover tint + caption */}
      <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/60 transition-all duration-300" aria-hidden="true" />
      <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 bg-linear-to-t from-zinc-950/95 to-transparent">
        <p className="text-xs font-medium text-zinc-100 leading-snug mb-0.5 truncate">{photo.caption}</p>
        <span className={`font-mono text-[10px] ${TAG_COLORS[photo.tag] ?? "text-zinc-500"}`}>#{photo.tag}</span>
      </div>
    </div>
  );
}

// ── Scroll Row ────────────────────────────────────────────
const ScrollRow = memo(function ScrollRow({ items, direction = "left", tall = false, animate = false, onOpen }) {
  const doubled = useMemo(() => [...items, ...items], [items]);
  const animDef = direction === "left"
    ? "scroll-left 40s linear infinite"
    : "scroll-right 36s linear infinite";

  return (
    <div className={`overflow-hidden group/row transition-opacity duration-500 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div
        className="flex gap-3 w-max group-hover/row:[animation-play-state:paused] will-change-transform"
        style={animate ? { animation: animDef } : undefined}
      >
        {doubled.map((photo, i) => (
          <PhotoCard key={`${photo.id}-${i}`} photo={photo} tall={tall} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
});

// ── Gallery Section ───────────────────────────────────────
export default function Gallery() {
  const sectionRef  = useRef(null);
  const loadingRef  = useRef(false);

  const [resolvedPhotos, setResolvedPhotos] = useState({
    row1: gallery.row1,
    row2: gallery.row2,
  });
  const [animate,  setAnimate]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const [activeId, setActiveId] = useState(null);

  // Flat unique list for modal navigation
  const allPhotos = useMemo(
    () => [...resolvedPhotos.row1, ...resolvedPhotos.row2],
    [resolvedPhotos]
  );
  const activeIdx = allPhotos.findIndex(p => p.id === activeId);
  const activePhoto = activeIdx !== -1 ? allPhotos[activeIdx] : null;

  const openModal  = useCallback((id) => setActiveId(id), []);
  const closeModal = useCallback(() => setActiveId(null), []);
  const prevPhoto  = useCallback(() => setActiveId(allPhotos[activeIdx - 1]?.id), [allPhotos, activeIdx]);
  const nextPhoto  = useCallback(() => setActiveId(allPhotos[activeIdx + 1]?.id), [allPhotos, activeIdx]);

  const startLoading = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const allRaw = [
      ...gallery.row1.map(p => ({ ...p, row: "row1" })),
      ...gallery.row2.map(p => ({ ...p, row: "row2" })),
    ].filter(p => p.src);

    const threshold = Math.min(3, allRaw.length);
    const resolvedMap = new Map();
    let firstBatchDone = false;

    function applyMap(prev, map) {
      const next = { row1: [...prev.row1], row2: [...prev.row2] };
      map.forEach(({ row, src }, id) => {
        const idx = next[row].findIndex(p => p.id === id);
        if (idx !== -1) next[row][idx] = { ...next[row][idx], resolvedSrc: src };
      });
      return next;
    }

    await Promise.all(
      allRaw.map(async (photo) => {
        const loader = getLoader(photo.src);
        if (!loader) return;
        try {
          const mod = await loader();
          resolvedMap.set(photo.id, { row: photo.row, src: mod.default });
          // First batch: show & animate as soon as threshold images are ready
          if (!firstBatchDone && resolvedMap.size >= threshold) {
            firstBatchDone = true;
            setResolvedPhotos(prev => applyMap(prev, new Map(resolvedMap)));
            setAnimate(true);
          }
        } catch {}
      })
    );

    // Single final update for any remaining images
    setResolvedPhotos(prev => applyMap(prev, resolvedMap));
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
    <>
      <section
        ref={sectionRef}
        id="gallery"
        aria-label="Sarwar Hossain Photo Gallery"
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
            <p className="font-mono text-xs text-zinc-700 shrink-0 pb-1">click to open · hover to pause</p>
          </div>
        </div>

        {/* Film strip rows */}
        <div className="space-y-3">
          <ScrollRow items={resolvedPhotos.row1} direction="left"  tall={false} animate={animate} onOpen={openModal} />
          <ScrollRow items={resolvedPhotos.row2} direction="right" tall={true}  animate={animate} onOpen={openModal} />
        </div>
      </section>

      {/* Modal (portal) */}
      {activePhoto && (
        <PhotoModal
          key={activePhoto.id}
          photo={activePhoto}
          onClose={closeModal}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          hasPrev={activeIdx > 0}
          hasNext={activeIdx < allPhotos.length - 1}
        />
      )}
    </>
  );
}
