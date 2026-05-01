# Sarwar Hossain — Portfolio

> Personal portfolio of **Sarwar Hossain**, Senior Backend Engineer based in Dhaka, Bangladesh.  
> Built as a production-quality PWA — offline-first, SEO-optimised, and driven entirely from JSON content files.

**Live stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · Workbox PWA

---

## What's inside

| Section | Purpose |
|---|---|
| **Hero** | Name, role, availability badge, GitHub / LinkedIn / email CTAs |
| **About** | Bio and background |
| **Experience** | Work timeline (StarConnect · Bright Future Soft) |
| **Projects** | Featured project showcase |
| **War Room** | Production incidents — severity-coded postmortems with root-cause diagrams |
| **Skills** | Node.js · TypeScript · NestJS · Express · RabbitMQ · Redis · Socket.IO · PostgreSQL · MongoDB |
| **Gallery** | Infinite-scroll photo carousel |
| **Articles** | Blog / writing links |

Navigation adapts by viewport: sticky top bar on desktop, glass bottom-nav pill on mobile.

---

## Getting started

```bash
# install (legacy peer deps required for Vite 8 + some workbox packages)
npm install

# dev server with HMR
npm run dev

# production build
npm run build

# preview the built output locally
npm run preview
```

Requires **Node 24**.

---

## Project structure

```
src/
├── data/               ← JSON content — edit here, not in components
│   ├── profile.json
│   ├── experience.json
│   ├── projects.json
│   ├── skills.json
│   ├── challenges.json
│   ├── articles.json
│   └── gallery.json
│
├── components/
│   ├── ui/             ← Badge · Button · Icon · SectionHeader · UpdatePrompt
│   ├── layout/         ← Navbar · Footer · BottomNav
│   └── sections/       ← one file per page section
│
├── hooks/
│   ├── useTheme.js     ← dark/light mode, persisted to localStorage
│   └── usePWA.js       ← SW registration, update detection, install prompt
│
├── pages/
│   └── Home.jsx        ← lazy-loads all below-fold sections via React.lazy + Suspense
│
└── sw.js               ← custom Workbox service worker (injectManifest)

public/
├── icons/              ← 192 × 192 and 512 × 512 PWA icons
├── offline.html        ← offline fallback page
├── robots.txt
└── sitemap.xml
```

---

## Customising content

All page content lives in `src/data/`. No component edits needed for routine updates.

**Profile photo**

```jsonc
// src/data/profile.json
{ "photo": "/src/assets/your-photo.jpg" }   // or null for initials avatar
```

**War Room incidents** (`src/data/challenges.json`)

```jsonc
{
  "id": "inc-007",
  "incidentId": "INC-2025-007",
  "severity": "P0",          // P0 · P1 · P2 · P3
  "title": "...",
  "summary": "...",
  "rootCause": "...",
  "resolution": "...",
  "metrics": ["..."],
  "tech": ["Redis", "NestJS"],
  "featured": true,          // full-width layout with SVG diagram
  "visual": "memory",        // database · lock · memory · query · security
  "gradient": ["#f59e0b", "#ef4444"]
}
```

---

## Design system

| Token | Value |
|---|---|
| Primary accent | `amber-500` / `#f59e0b` |
| Neutral scale | `zinc` |
| Dark mode | `.dark` class on `<html>` — `@custom-variant dark (&:where(.dark, .dark *))` |
| Body font | Inter Variable (self-hosted via `@fontsource-variable/inter`) |
| Mono font | JetBrains Mono (self-hosted via `@fontsource/jetbrains-mono`) |
| Animations | `fade-up` · `scroll-left` · `scroll-right` keyframes in `index.css` |

Light-mode overrides live at the bottom of `index.css` as `html:not(.dark) .{class}` selectors — these are unlayered and therefore win over `@layer utilities`.

---

## PWA & offline support

Service worker uses Workbox's **injectManifest** strategy (custom `src/sw.js`, not auto-generated).

| Asset type | Strategy | TTL / limit |
|---|---|---|
| App shell (HTML + chunks) | Cache-first (precache) | — |
| Images | Cache-first | 30 days · max 80 |
| Fonts | Cache-first | 365 days · max 30 |
| `/api/*` responses | Network-first (3 s timeout) | 5 min · max 50 |
| JS/CSS chunks | Stale-while-revalidate | — |
| Contact form `POST /api/contact` | Network-first + **Background Sync** | 24 h retry window |
| Failed navigations | Serve `offline.html` | — |

An `<UpdatePrompt />` toast appears when a new SW version is waiting — the user confirms, the page reloads with the update applied.

---

## SEO

`index.html` ships with:
- Open Graph + Twitter Card meta tags
- JSON-LD `Person` schema
- `<link rel="preload">` for `profile.png` (LCP image)
- Dark-theme script that runs before first paint (no flash)
- `public/robots.txt` and `public/sitemap.xml`

---

## Performance notes

- Below-fold sections are code-split with `React.lazy()` — only Hero ships in the initial bundle.
- Fonts are self-hosted — zero CDN round-trips.
- Gallery images are lazy-loaded and cached by the SW.
- Mobile bottom-nav is hidden on `lg:` breakpoints; footer is hidden below `lg:`.

---

## Tech stack

```
Runtime    Node 24
Framework  React 19 + React Router v7
Build      Vite 8 + @vitejs/plugin-react 6
Styling    Tailwind CSS v4 (@tailwindcss/vite)
PWA        vite-plugin-pwa + Workbox 7
Fonts      @fontsource-variable/inter · @fontsource/jetbrains-mono
Lint       ESLint 9 (flat config) + react-hooks + react-refresh
```

---

## License

Personal portfolio — all rights reserved. Not a template; please don't redistribute.
