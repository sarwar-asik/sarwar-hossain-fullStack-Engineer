import { useState, useEffect } from "react";
import Icon from "../ui/Icon";

const NAV_ITEMS = [
  { label: "Home",    href: "#",           section: "hero",    icon: "home"      },
  { label: "Work",    href: "#challenges", section: "work",    icon: "briefcase" },
  { label: "Skills",  href: "#skills",     section: "skills",  icon: "zap"       },
  { label: "Gallery", href: "#gallery",    section: "gallery", icon: "camera"    },
  { label: "Contact", href: "#contact",    section: "contact", icon: "mail"      },
];

const SECTION_IDS = [
  "hero", "challenges", "experience", "projects",
  "skills", "articles", "gallery", "contact",
];

function mapToNav(id) {
  if (!id || id === "hero")                                    return "hero";
  if (["challenges", "experience", "projects"].includes(id))  return "work";
  if (["skills", "articles"].includes(id))                    return "skills";
  if (id === "gallery")                                        return "gallery";
  return "contact";
}

export default function BottomNav() {
  const [active, setActive] = useState("hero");
  const [tapped, setTapped] = useState(null);

  useEffect(() => {
    let raf;

    function detect() {
      const threshold = window.innerHeight * 0.55;
      // Walk from bottom section upward — first one whose top ≤ threshold wins
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.getBoundingClientRect().top <= threshold) {
          setActive(SECTION_IDS[i]);
          return;
        }
      }
      setActive("hero");
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(detect);
    }

    // Both listeners needed: iOS Safari can drop window scroll events
    // when html has overflow-x:hidden
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });

    // Poll to pick up lazy-loaded sections after they enter the DOM
    const poll = setInterval(detect, 400);

    detect();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearInterval(poll);
    };
  }, []);

  const activeMapped = mapToNav(active);
  const activeIdx    = Math.max(0, NAV_ITEMS.findIndex((n) => n.section === activeMapped));

  function handleTap(item) {
    setTapped(item.section);
    setTimeout(() => setTapped(null), 350);
    if (item.href === "#") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      className="lg:hidden"
    >
      {/* Glass pill */}
      <div
        style={{
          margin: "0 12px 12px",
          borderRadius: 20,
          overflow: "hidden",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(18, 18, 20, 0.92)",
          border: "1px solid rgba(63, 63, 70, 0.6)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        }}
      >
        {/* Sliding amber bar */}
        <div style={{ position: "relative", display: "flex" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              height: 3,
              borderRadius: 99,
              background: "#f59e0b",
              width: `${100 / NAV_ITEMS.length}%`,
              left: `${(activeIdx / NAV_ITEMS.length) * 100}%`,
              transition: "left 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />

          {NAV_ITEMS.map((item) => {
            const isActive = item.section === activeMapped;
            const isTapped = tapped === item.section;

            return (
              <a
                key={item.section}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleTap(item)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 12,
                  paddingBottom: 10,
                  gap: 3,
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  textDecoration: "none",
                }}
              >
                {/* Icon container */}
                <span
                  style={{
                    width: 40,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    background: isActive ? "rgba(245,158,11,0.22)" : "transparent",
                    border: isActive ? "1px solid rgba(245,158,11,0.35)" : "1px solid transparent",
                    color: isActive ? "#fbbf24" : "#71717a",
                    transform: isTapped ? "scale(0.78)" : isActive ? "scale(1.07)" : "scale(1)",
                    transition: "transform 200ms cubic-bezier(0.175,0.885,0.32,1.275), background 200ms ease, color 200ms ease, border-color 200ms ease",
                  }}
                >
                  <Icon name={item.icon} className="w-[18px] h-[18px]" />
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "0.04em",
                    color: isActive ? "#f59e0b" : "#52525b",
                    transition: "color 200ms ease, font-weight 200ms ease",
                  }}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
