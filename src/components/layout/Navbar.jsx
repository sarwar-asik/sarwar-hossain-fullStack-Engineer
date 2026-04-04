import { useState, useEffect } from 'react'
import Icon from '../ui/Icon'
import profile from '../../data/profile.json'

const NAV_LINKS = [
  { label: 'About',      href: '#about'       },
  { label: 'Experience', href: '#experience'  },
  { label: 'Projects',   href: '#projects'    },
  { label: 'War Room',   href: '#challenges'  },
  { label: 'Skills',     href: '#skills'      },
  { label: 'Life',       href: '#gallery'     },
  { label: 'Articles',   href: '#articles'    },
]

export default function Navbar({ theme, onThemeToggle }) {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeSection, setActive]  = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = NAV_LINKS.map(l => document.querySelector(l.href)).filter(Boolean)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-zinc-50/92 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 py-3'
            : 'bg-transparent py-5'
          }
        `}
      >
        <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <a href="#" aria-label="Home" className="flex items-center gap-2.5 group">
            <span className="font-mono text-sm text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded group-hover:bg-amber-500/10 transition-colors">
              {profile.initials}
            </span>
            <span className="text-sm font-medium text-zinc-400 hidden sm:block group-hover:text-zinc-200 transition-colors">
              {profile.name}
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`
                    px-3 py-1.5 text-sm rounded-md transition-colors
                    ${activeSection === link.href.slice(1)
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }
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
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-3.5 h-3.5" />
            </button>

            <a
              href={`mailto:${profile.email}`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-500/30 text-amber-500 text-xs font-mono hover:bg-amber-500/10 transition-colors"
            >
              Hire Me
            </a>

            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`
        fixed top-0 right-0 bottom-0 z-50 w-64 md:hidden
        bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800
        transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-mono text-xs text-amber-500">{profile.initials}</span>
          <button onClick={() => setMenuOpen(false)} className="text-zinc-500 hover:text-zinc-200">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-0.5">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <a
              href={`mailto:${profile.email}`}
              className="block w-full text-center px-3 py-2 rounded-md border border-amber-500/30 text-amber-500 text-xs font-mono hover:bg-amber-500/10 transition-colors"
            >
              Hire Me
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
