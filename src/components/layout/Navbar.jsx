import { useState, useEffect } from "react";
import Icon from "../ui/Icon";
import profile from "../../data/profile.json";

const NAV_LINKS = [
  { label: "War Room", href: "#challenges" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Articles", href: "#articles" },
  { label: "Life", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ theme, onThemeToggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-md focus:bg-amber-500 focus:text-zinc-950 focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>

      <header
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${scrolled ? "bg-zinc-50/92 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 py-3" : "bg-transparent py-5"}
        `}
      >
        <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo + mobile breadcrumb */}
          <a href="#" aria-label="Home" className="flex items-center gap-2 group">
            <span className="font-mono text-sm text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded group-hover:bg-amber-500/10 transition-colors">
              {profile.initials}
            </span>

            {/* Mobile: section breadcrumb that morphs in when scrolled */}
            <span
              className="lg:hidden flex items-center gap-1 overflow-hidden"
              style={{
                maxWidth: activeSection ? "160px" : "0px",
                opacity: activeSection ? 1 : 0,
                transition: "max-width 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease",
              }}
            >
              <span className="font-mono text-xs text-zinc-700 shrink-0">/</span>
              <span className="font-mono text-xs text-zinc-500 truncate">{activeSection}</span>
            </span>

            {/* Desktop: full name */}
            <span className="text-sm font-medium text-zinc-400 hidden lg:block group-hover:text-zinc-200 transition-colors">{profile.name}</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`
                    px-3 py-1.5 text-sm rounded-md transition-colors
                    ${activeSection === link.href.slice(1) ? "text-amber-500 dark:text-amber-400" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}
                  `}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onThemeToggle}
              aria-label="Toggle theme"
              aria-pressed={theme === "dark"}
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} className="w-3.5 h-3.5" />
            </button>

            <a
              href={`mailto:${profile.email}`}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-500/30 text-amber-500 text-xs font-mono hover:bg-amber-500/10 transition-colors"
            >
              Hire Me
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
