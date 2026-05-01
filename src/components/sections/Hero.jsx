import { useState } from "react";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import profile from "../../data/profile.json";

/* ── Profile photo / avatar ─────────────────────────────── */
function ProfileAvatar() {
  const { name, initials, role, available, photo } = profile;
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = photo && !imgFailed;

  return (
    <div className="hidden lg:flex items-center justify-center relative select-none">
      {/* Ambient glow blob */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Decorative grid */}
      <div
        className="absolute w-96 h-96 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Photo frame */}
        <div className="relative w-64 h-64">
          {/* Outer decorative ring */}
          <div className="absolute -inset-3 rounded-full border border-amber-500/15 border-dashed animate-[spin_30s_linear_infinite]" aria-hidden="true" />
          <div className="absolute -inset-1.5 rounded-full border border-amber-500/20" aria-hidden="true" />

          {/* Photo / initials */}
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/30 bg-zinc-900 dark:bg-zinc-900 flex items-center justify-center shadow-2xl">
            {showPhoto ? (
              <img
                src={photo}
                alt={`${name} (Sarwar Asik) – Software Engineer & Backend Engineer`}
                width={256}
                height={256}
                fetchpriority="high"
                className="w-full h-full object-cover object-top"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #27272a 0%, #18181b 60%, #1c1917 100%)" }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle at 30% 30%, rgba(245,158,11,0.08), transparent 60%)" }}
                  aria-hidden="true"
                />
                <span className="font-mono text-6xl font-bold text-zinc-700 z-10 select-none">{initials}</span>
              </div>
            )}
          </div>

          {/* Available status badge — bottom right */}
          {available && (
            <div className="absolute bottom-3 right-0 flex items-center gap-1.5 bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded-full px-3 py-1 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400">available</span>
            </div>
          )}
        </div>

        {/* Name + role pill */}
        <div className="text-center">
          <p className="font-semibold text-zinc-200 dark:text-zinc-200 text-sm">{name}</p>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{role.toLowerCase().replace(/ /g, "_")}</p>
        </div>

        {/* Floating stat cards */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {profile.stats.slice(0, 3).map((s) => (
            <div key={s.label} className="bg-zinc-900/80 dark:bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-center backdrop-blur-sm">
              <div className="text-base font-bold text-zinc-100 dark:text-zinc-100">{s.value}</div>
              <div className="font-mono text-[9px] text-zinc-600 mt-px">{s.label.toLowerCase().replace(/ /g, "_")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile-only hero photo block ───────────────────────── */
function MobileHeroPhoto() {
  const { name, initials, available, photo } = profile;
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = photo && !imgFailed;

  return (
    <div className="lg:hidden flex flex-col items-center mb-10 select-none">
      {/* p-8 wrapper gives rings and viewfinder room to breathe */}
      <div className="relative p-8">
        {/* Viewfinder corner accents */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-500/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-500/50" />
        </div>

        {/* Photo + rings */}
        <div className="relative w-36 h-36">
          {/* Ambient glow */}
          <div
            className="absolute -inset-8 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          {/* Spinning dashed ring */}
          <div className="absolute -inset-3 rounded-full border border-amber-500/15 border-dashed animate-[spin_30s_linear_infinite]" aria-hidden="true" />
          {/* Static ring */}
          <div className="absolute -inset-1.5 rounded-full border border-amber-500/20" aria-hidden="true" />

          {/* Photo */}
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/30 bg-zinc-900 shadow-2xl flex items-center justify-center">
            {showPhoto ? (
              <img
                src={photo}
                alt={`${name} (Sarwar Asik) – Software Engineer & Backend Engineer`}
                width={144}
                height={144}
                className="w-full h-full object-cover object-top"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #27272a 0%, #18181b 60%, #1c1917 100%)" }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle at 30% 30%, rgba(245,158,11,0.08), transparent 60%)" }}
                  aria-hidden="true"
                />
                <span className="font-mono text-5xl font-bold text-zinc-700 z-10 select-none">{initials}</span>
              </div>
            )}
          </div>

          {/* Available badge — bottom centre */}
          {available && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-full px-3 py-1 shadow-lg whitespace-nowrap z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400">available</span>
            </div>
          )}
        </div>
      </div>

      {/* Dev label */}
      <p className="font-mono text-[10px] text-zinc-600 -mt-1">// profile.identity</p>
    </div>
  );
}

/* ── Hero section ───────────────────────────────────────── */
export default function Hero() {
  const { name, role, bio, available, social, stats } = profile;
  const [first, ...rest] = name.split(" ");

  return (
    <section
      id="hero"
      aria-label="Sarwar Hossain | Sarwar Asik – Software Engineer & Backend Engineer"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-zinc-950 dark:bg-zinc-950"
    >
      {/* Ambient amber glow — top-left */}
      <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* ── Left: content ── */}
          <div>
            {/* Mobile photo block — desktop sees ProfileAvatar in the right column */}

            {/* Available status — hidden on mobile when available (MobileHeroPhoto owns it) */}
            {available ? (
              <div className="hidden lg:block anim mb-10">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-amber-500 border border-amber-500/20 rounded px-2.5 py-1 bg-amber-500/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  open_to_work = true
                </span>
              </div>
            ) : (
              <div className="anim mb-10">
                <span className="font-mono text-xs text-zinc-600">// not currently looking</span>
              </div>
            )}

            {/* Name */}
            <h1 className="anim anim-d1 font-bold tracking-tight leading-none text-zinc-100 dark:text-zinc-100 mb-6">
              <span className="block text-5xl sm:text-7xl lg:text-8xl">{first}</span>
              <span className="block text-5xl sm:text-7xl lg:text-8xl text-amber-500">{rest.join(" ")}.</span>
              <span className="sr-only"> | Sarwar Asik – Software Engineer &amp; Backend Engineer, Dhaka Bangladesh</span>
            </h1>

            {/* Role */}
            <p className="anim anim-d2 font-mono text-sm text-zinc-500 mb-6 tracking-wide">{role.toLowerCase().replace(/ /g, "_")}</p>

            <MobileHeroPhoto />
            {/* Bio */}
            <p className="anim anim-d3 text-base text-zinc-400 dark:text-zinc-400 max-w-lg leading-relaxed mb-10">{bio}</p>

            {/* Stats row */}
            <div className="anim anim-d3 flex flex-wrap items-center gap-x-8 gap-y-4 py-6 border-t border-b border-zinc-800 dark:border-zinc-800 mb-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-zinc-100 dark:text-zinc-100">{s.value}</div>
                  <div className="font-mono text-xs text-zinc-600 mt-0.5">{s.label.toLowerCase().replace(/ /g, "_")}</div>
                </div>
              ))}
            </div>

            {/* CTAs + social */}
            <div className="anim anim-d4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button href="#projects" size="lg">
                  View Projects
                  <Icon name="arrowRight" className="w-4 h-4" />
                </Button>
                <Button href="#contact" variant="outline" size="lg">
                  <Icon name="mail" className="w-4 h-4" />
                  Get in Touch
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {social.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-600 hover:text-amber-400 hover:bg-zinc-900 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-800 dark:hover:border-zinc-800 transition-all"
                  >
                    <Icon name={s.icon} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: profile visual (desktop only) ── */}
          <ProfileAvatar />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-700 animate-bounce">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
