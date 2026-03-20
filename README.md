# Atomity — Frontend Engineering Challenge

## Live Demo
[https://chellange.vercel.app/]

## Repository
[https://github.com/hanynan8/Chellange]

---

## Feature Chosen — Option B (0:45–0:55)

I chose the cloud provider cost-monitor section. The segment shows multiple cloud providers (AWS, Azure, GCP, On-Prem) converging into a unified cost intelligence view with animated metrics and a data breakdown panel.

My interpretation goes beyond the video reference: instead of a static reveal, I built a **scroll-driven narrative** where the user physically scrolls through a story — providers appear, connect via animated SVG beams, Azure zooms in to reveal sub-metrics, and finally a data panel slides in from the left anchored by a live connector line. The experience is meant to feel like the platform is "showing its work" in real time.

---

## Animation Approach

All animations are driven by a single scroll progress value (`sec2Progress`, a float from `0` to `1`) computed via Framer Motion's `useScroll` + `useMotionValueEvent`. No timers, no IntersectionObserver — every visual state is a pure function of scroll position.

**Scroll narrative breakdown:**

| Scroll range | What happens |
|---|---|
| `0.00 – 0.05` | Provider orbs fade + slide in from edges |
| `0.04 – 0.10` | SVG beam lines draw from providers to center card |
| `0.02 – 0.07` | Central cost monitor card scales up |
| `0.23 – 0.53` | Azure zooms forward, others fade out |
| `0.46 – 0.64` | Sub-metric micro-vortexes reveal inside Azure one by one |
| `0.67 – 0.75` | Connector line draws from Azure to data panel |
| `0.80 – 0.87` | Data panel slides in, cells stagger in |

**Performance:** scroll handler is wrapped in `requestAnimationFrame` on mobile to prevent jank. On desktop, Framer Motion's `useMotionValueEvent` runs outside React's render cycle.

**Easing:** all values use linear interpolation with `Math.min(1, Math.max(0, (sp - start) / duration))` — this gives a natural ease feel because each element has its own start/end window within the scroll range.

---

## Tokens & Styles Structure

```
styles/
  tokens.css   — all design tokens as CSS custom properties
  theme.js     — JS object that maps token names to var(--token-name)
```

**tokens.css uses:**
- `color-mix(in srgb, ...)` to derive soft/glow variants from base colors — no hardcoded rgba values
- Native CSS nesting for component-scoped styles (`.cost-monitor { & .waste-row { ... } }`)
- Logical properties (`block-size`, `inline-size`, `inset-inline-end`, `margin-block-end`) for writing-mode agnostic layout
- `clamp()` for all fluid sizing tokens (`--orb-size`, `--card-padding`, `--font-size-*`)
- `data-theme="dark"` attribute on `<html>` for instant dark/light switching without JS re-renders

**theme.js** exports a `T` object and a `resolveColor(colorKey)` function. Components import these and never reference raw hex values.

---

## Data Fetching & Caching

Data is fetched from the internal API endpoint `/api/data?collection=Chellange` on mount.

**Caching strategy — manual sessionStorage with TTL:**

```js
const CACHE_KEY = "atomity_challenge_data";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// On mount: check cache first
const cached = getCached();
if (cached) { setData(cached); return; }

// On success: write to cache with timestamp
setCache(safe);
```

- First visit: shows loading spinner → fetches → renders
- Revisit within 5 minutes: reads from `sessionStorage`, renders instantly, zero network requests
- After TTL expires: cache is cleared, fresh fetch on next visit

The Network tab will show exactly one request per session unless the TTL expires.

---

## Libraries Used

| Library | Why |
|---|---|
| **Next.js (App Router)** | File-based routing, server components, built-in optimizations |
| **Framer Motion** | `useScroll` + `useMotionValueEvent` give precise scroll progress outside React's render cycle — critical for 60fps scroll animations |
| **React (hooks only)** | `useRef`, `useState`, `useEffect`, `useCallback` for all state and DOM interaction |

No UI component libraries used. Every element — orbs, arc progress rings, SVG logos, metric bars, data panels — is built from scratch.

---

## File Structure

```
src/
  styles/
    tokens.css          — CSS variables, color-mix(), nesting, clamp()
    theme.js            — JS token map + resolveColor()
  hooks/
    useCloudData.js     — fetch + sessionStorage cache
    useBreakpoint.js    — isMobile + windowWidth
    useDarkMode.js      — dark toggle + applyTheme() + reducedMotion
  components/
    VortexOrb.jsx       — circular orb with glow rings
    ProviderLogos.jsx   — AWS / Azure / GCP / OnPrem SVG logos
    DataPanel.jsx       — ArcProgress, MiniMetricBars, MicroVortex,
                          ResourceMetricsCard, ZoomDataPanel
  app/
    page.jsx            — page composition, scroll logic, Desktop + Mobile sections
```

---

## Tradeoffs & Decisions

**Inline styles vs CSS classes**
The scroll-driven animations require dynamic values computed every frame (opacity, transform, scale). These can't be expressed in static CSS classes, so inline styles are used for animated properties. Static layout and typography use CSS classes from `tokens.css`.

**Single scroll progress value**
All animation state derives from one `sec2Progress` float rather than multiple independent observers. This makes the timeline easy to reason about and debug — scrubbing scroll shows exactly what each value controls.

**Mobile vs Desktop sections**
Rather than a single responsive component, I split into `MobileCombinedSection` and `DesktopCombinedSection`. The scroll timings, orb sizes, and layout are different enough that a single component would be harder to read and maintain.

**sessionStorage vs React Query**
React Query would be the production choice for cache invalidation, background refetching, and devtools. For this challenge, manual sessionStorage with a 5-minute TTL is simpler, has zero dependencies, and satisfies the requirement of no redundant requests.

**JavaScript over TypeScript**
The project is written in JavaScript. TypeScript was listed as "preferred" in the challenge but not required. Given the time constraint, I prioritized animation quality and component architecture over type annotations — TypeScript would be the first thing I'd add with more time.

---

## AI Assistance Disclosure

I used Claude (claude.ai) as a development tool during this challenge — similar to how a developer would use Copilot or ChatGPT for code suggestions.

Every architectural decision in this project was mine: the choice of scroll-driven animation over IntersectionObserver, the single progress value approach, the Desktop/Mobile split, the sessionStorage TTL cache, the CSS nesting + color-mix token strategy, and the component breakdown across hooks/components/styles.

I directed the implementation, reviewed every file, caught bugs, and can explain any line of code if asked. The AI accelerated the execution — the thinking and decisions were mine.

---

## What I Would Improve With More Time

- **TypeScript** — add full type annotations for all props, hook return values, and API shapes
- **React Query / TanStack Query** — replace manual sessionStorage cache with proper query management, background refetch, and stale-while-revalidate
- **Container queries** — replace the `useBreakpoint` JS hook with `@container` queries so components respond to their own size rather than the viewport
- **Framer Motion `motion` components** — replace manual scroll math with `useTransform` and `motion.div` for cleaner declarative animations
- **E2E tests** — Playwright tests for scroll milestones and dark mode toggle
- **More animation polish** — spring physics on the Azure zoom, staggered orb entrance with Framer Motion's `staggerChildren`