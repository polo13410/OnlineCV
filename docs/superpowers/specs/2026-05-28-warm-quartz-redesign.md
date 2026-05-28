# Warm Quartz Redesign + Magnetic Scroll

**Date:** 2026-05-28  
**Branch:** feat/bbl  
**Approach:** Full rework in one branch (Approach A)

---

## Context

The existing CV app shipped a Terminal/Observatory aesthetic (dark, monospace, cyan accents, mac-dot chrome). The feedback: too "nerdy", too much terminal flavour throughout. The goal is a **sober, clean, warm** interface — "clean quartz" — with a novel **magnetic scroll** interaction on the Experiences and Education pages that guides users through card content without requiring explicit clicks.

---

## 1. Design System

### Palette — Warm Stone (light default)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg-base` | `#faf8f5` | Body background |
| `--color-bg-surface` | `#f4f1eb` | Sidebar, card headers |
| `--color-bg-elevated` | `#e9e4dc` | Hover states, raised elements |
| `--color-bg-overlay` | `#e0d8cd` | Debug panel, modals |
| `--color-accent-primary` | `#b8935a` | Amber — active borders, links, dots |
| `--color-accent-secondary` | `#8a6e40` | Darker amber for hover |
| `--color-text-primary` | `#2d2416` | Main text |
| `--color-text-secondary` | `#7a6a55` | Subtitles, metadata |
| `--color-text-muted` | `#c4b49a` | Overlines, placeholders |
| `--color-border` | `#e5ddd1` | Standard borders |
| `--color-border-accent` | `rgba(184,147,90,0.3)` | Active card border |

Dark theme retains the existing dark tokens (available via toggle, not default).

### Typography

- **Font:** `DM Sans` (variable weight 300–700, Google Fonts) — replaces Martian Mono everywhere **except** easter egg contexts (debug panel, 404 page)
- Body size: `0.875rem`, line-height `1.65`
- Headings: DM Sans 700

### Section Headers (all pages)

```
OVERLINE               ← 9px, uppercase, letter-spacing 0.1em, --color-text-muted
Bold Section Title     ← 15px, DM Sans 700, --color-text-primary
────────────────────   ← 1px hairline, --color-border
```

No `>_` prefix on primary section headers.

### Shadows & Depth

Warm brown box-shadows replace all glow effects:
- Default card: `0 1px 4px rgba(80,60,20,0.06)`
- Active card: `0 8px 40px rgba(80,60,20,0.13)`
- No CSS `text-shadow` glow on primary UI

### ThemeService

Default changes from `'dark'` to `'light'`. Existing dark theme remains accessible via the toggle (◑/◐).

---

## 2. Layout & Navigation

### Removed from NavComponent

- Three-dot mac chrome (`dot-red/yellow/green` + label)
- `paul@portfolio:~$` terminal label

### NavComponent structure (unchanged otherwise)

```
┌─────────────────────┐
│  Paul               │  ← name (700) + surname (accent colour)
│  Développeur full.. │  ← subtitle (muted)
├─────────────────────┤
│  › accueil          │  ← active: amber left border + amber text
│    expériences      │
│    formation        │
│    compétences      │
│    passions         │
├─────────────────────┤
│  [FR] / [EN]        │  ← 5× click → debug panel easter egg
├─────────────────────┤
│  ↓ CV.pdf  [in][gh] │
└─────────────────────┘
```

All colours swap to warm tokens. No structural changes.

### Debug Panel (easter egg)

Triggered by 5 consecutive clicks on FR or EN within 2 seconds. Warm stone styled (no terminal chrome). Colour pickers for 8 CSS custom properties, persisted to localStorage.

### CursorComponent

Kept unchanged — custom dot + ring cursor still active on desktop.

---

## 3. MagneticScrollComponent (new)

**Path:** `src/app/shared/magnetic-scroll/`  
**Files:** `magnetic-scroll.component.ts`, `.html`, `.scss`

### Input interface

```typescript
export interface MagneticScrollItem {
  title:        string;
  organisation: string;  // company or school name
  location:     string;
  dateFrom:     string;
  dateTo:       string;
  descriptions: string[];
}
```

### Behaviour

One `progress` float (range `[0, N-1]`) is the single source of truth. `render(p)` is called every animation frame during drag and spring animation — **no CSS transitions on `transform`, `opacity`, or `filter`**.

**Card positions** interpolated from `progress`:

| `|offset|` from centre | Y position | Opacity | Blur | Scale |
|---|---|---|---|---|
| 0 (centred) | `stageH/2 − expandedH/2` | 1.0 | 0px | 1.0 |
| 1 (edge) — above | bottom edge at `PEEK=72px` from top | 0.38 | 2.5px | 0.97 |
| 1 (edge) — below | top edge at `stageH − 72px` | 0.38 | 2.5px | 0.97 |
| > 1.6 | off-screen | hidden | — | — |

All values between 0 and 1 are linearly interpolated via `lerp`.

**Height measurement:** `measureExpandedHeight(wrap)` temporarily removes `max-height` constraints (no transition, same JS task → no paint), reads `offsetHeight`, restores. Called before `goTo()` so the card is positioned to its final expanded size from the start — no two-step rebound.

**Active card:** determined by `Math.round(progress)`. `.active` class toggled when nearest integer changes. Body `max-height` expansion uses a CSS transition (independent of position tracking).

**Spring snap:**
```
progress += (target − progress) × 0.16   // each rAF frame
Stop when |diff| < 0.003
```

**Input handling:**

| Input | Behaviour |
|-------|-----------|
| Discrete wheel (`deltaMode=1` or `|deltaY|≥100`) | `goTo(nearest ± 1)`, 450ms cooldown |
| Smooth wheel / trackpad | Live `progress += deltaY / 160`, snap after 120ms silence |
| Touch | `touchstart` saves `{y, progress}`; `touchmove` computes from origin (no drift); `touchend` snaps |
| Arrow keys | `goTo(nearest ± 1)` |
| Click card header | `goTo(index)` |

**Edge resistance:** at first/last card, over-drag clamped to ±0.15 card-units with `0.3×` damping.

### Usage

```html
<!-- experiences.component.html -->
<app-magnetic-scroll [items]="experiences" />

<!-- education.component.html -->
<app-magnetic-scroll [items]="educations" />
```

`ExperiencesComponent` maps its `Experiences` data to `MagneticScrollItem[]` (pro + stage separated into two `<app-magnetic-scroll>` instances with section headers between them).

`EducationComponent` maps its `Education[]` data directly.

---

## 4. Page Components

### Homepage

- Token swap only (warm palette, DM Sans)
- Typewriter effect on job title: kept
- Profile block: single `>_  cat profile.txt` prompt line kept as a subtle easter egg before the profile text — the only `>_` on a main page

### Skills

- Category directory blocks: left amber border retained (fits warm aesthetic)
- Skill tag pills: warm border (`--color-border`), amber glow on hover for advanced/intermediate
- **Mobile fix:** proficiency level rendered as a small muted line below the skill name always visible (not hover-only) — `font-size: var(--font-size-xs); color: var(--color-text-muted)`

### Passions

- Token swap only. Tile grid unchanged.

### Not Found (intentional easter egg)

Kept in full terminal style — visitors landing on a bad URL get the joke:
- Large glitch-animated `404` (cyan, `@keyframes glitch`)
- `>_ ERROR: route not found`
- `>_ try: cd ~`

### App Module

`app.module.ts` already deleted. No change needed.

---

## 5. Easter Eggs Summary

| Location | Trigger | Effect |
|----------|---------|--------|
| Homepage profile | Visible always | `>_ cat profile.txt` prompt line |
| Language toggle | 5 consecutive clicks | Debug colour panel |
| Not Found page | Navigate to unknown route | Full terminal error style + glitch 404 |

---

## 6. Files Changed

| File | Action |
|------|--------|
| `src/styles/_tokens.scss` | Rewrite with warm stone palette |
| `src/styles/_mixins.scss` | Remove `terminal-window`, `terminal-dots`, `scanlines`; keep `page-container`, `section-header` (updated to overline style) |
| `src/styles.scss` | Remove glow keyframes, update scroll-reveal and base styles |
| `src/index.html` | Swap Martian Mono → DM Sans |
| `src/app/services/theme.service.ts` | Default `'dark'` → `'light'` |
| `src/app/layout/nav/nav.component.*` | Remove mac dots + terminal label; warm token swap |
| `src/app/layout/shell/shell.component.scss` | Token swap |
| `src/app/layout/theme-toggle/*` | Token swap |
| `src/app/shared/cursor/*` | Token swap |
| `src/app/shared/debug-panel/*` | Remove terminal chrome; warm stone styling |
| **`src/app/shared/magnetic-scroll/*`** | **New component** |
| `src/app/experiences/experiences.component.*` | Refactor to use `MagneticScrollComponent` |
| `src/app/education/education.component.*` | Refactor to use `MagneticScrollComponent` |
| `src/app/homepage/homepage.component.*` | Token swap, drop terminal chrome on hero |
| `src/app/skills/skills.component.*` | Token swap, mobile level fix |
| `src/app/passions/passions.component.*` | Token swap |
| `src/app/not-found/not-found.component.*` | Keep terminal style intentionally |

---

## 7. Verification

1. `ng build --configuration production` — zero errors
2. `ng serve` — check all 5 routes:
   - Homepage: warm palette, DM Sans, typewriter, `>_ cat profile.txt` visible
   - Experiences: magnetic scroll — trackpad live drag, mouse wheel 1 tick, spring snap, adjacent cards peeking blurred at edges
   - Education: same magnetic scroll behaviour
   - Skills: mobile — proficiency level visible without hover
   - Passions: tile grid in warm palette
3. Theme toggle: warm light → dark → back to light, persists on refresh
4. Debug panel: 5× FR/EN clicks opens panel, colours apply live, persist on refresh
5. Not Found: navigate to `/doesnotexist` — glitch 404 + terminal error lines
6. Custom cursor: dot follows mouse, ring expands on interactive elements
