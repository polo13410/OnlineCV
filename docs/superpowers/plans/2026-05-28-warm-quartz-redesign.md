# Warm Quartz Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Terminal/Observatory aesthetic with a warm stone palette + DM Sans typography, and build a `MagneticScrollComponent` used on both Experiences and Education pages.

**Architecture:** Token-first approach — rewrite `_tokens.scss` so the light-warm palette is the default; the dark theme becomes an override via `[data-theme='dark']`. New `MagneticScrollComponent` uses a single `progress` float driven by direct DOM manipulation and `requestAnimationFrame` — no Angular animations, no CSS transitions on position/opacity/filter.

**Tech Stack:** Angular 21 standalone, SCSS with CSS custom properties, DM Sans (Google Fonts), `requestAnimationFrame` + `ngZone.runOutsideAngular` for scroll engine.

---

## Task 1: Design System — Tokens, Mixins, Global Styles, Font

**Files:**
- Modify: `src/styles/_tokens.scss`
- Modify: `src/styles/_mixins.scss`
- Modify: `src/styles.scss`
- Modify: `src/index.html`

- [ ] **Step 1: Rewrite `src/styles/_tokens.scss`**

Replace the entire file. Light is now the default `apply-tokens()`; dark overrides live in `apply-dark-tokens()`. All glow effects become warm amber box-shadows in light; cyan glows survive in dark.

```scss
// src/styles/_tokens.scss
@mixin apply-tokens() {
  // Light theme — warm stone (default)
  --color-bg-base:          #faf8f5;
  --color-bg-surface:       #f4f1eb;
  --color-bg-elevated:      #e9e4dc;
  --color-bg-overlay:       #e0d8cd;

  --color-accent-primary:   #b8935a;
  --color-accent-secondary: #8a6e40;
  --color-accent-tertiary:  #6644aa;

  --color-text-primary:     #2d2416;
  --color-text-secondary:   #7a6a55;
  --color-text-muted:       #c4b49a;
  --color-text-accent:      var(--color-accent-primary);

  --color-border:           #e5ddd1;
  --color-border-accent:    rgba(184, 147, 90, 0.3);

  // Warm ambient shadows (replaces cyan glow in light)
  --glow-primary:   0 4px 16px rgba(184, 147, 90, 0.25);
  --glow-secondary: 0 4px 16px rgba(138, 110, 64, 0.2);
  --glow-subtle:    0 2px 8px  rgba(184, 147, 90, 0.15);

  --font-main:        'DM Sans', system-ui, sans-serif;
  --font-mono:        'Martian Mono', 'Courier New', monospace;
  --font-size-xs:     0.65rem;
  --font-size-sm:     0.75rem;
  --font-size-base:   0.875rem;
  --font-size-md:     1rem;
  --font-size-lg:     1.125rem;
  --font-size-xl:     1.5rem;
  --font-size-2xl:    2rem;
  --font-size-3xl:    2.8rem;
  --line-height-tight: 1.3;
  --line-height-base:  1.65;

  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-7:  48px;
  --space-8:  64px;

  --sidebar-width:     256px;
  --header-height:     52px;
  --content-max-width: 860px;
  --border-radius-sm:  3px;
  --border-radius-md:  6px;
  --border-radius-lg:  10px;

  --transition-fast:  0.12s ease;
  --transition-base:  0.22s ease;
  --transition-slow:  0.4s ease;

  // Terminal chrome dots (kept for easter eggs)
  --terminal-dot-red:    #ff5f57;
  --terminal-dot-yellow: #febc2e;
  --terminal-dot-green:  #28c840;
  --terminal-prompt:     var(--color-accent-primary);
}

@mixin apply-dark-tokens() {
  --color-bg-base:          #070b14;
  --color-bg-surface:       #0f1629;
  --color-bg-elevated:      #162035;
  --color-bg-overlay:       #1c2a45;
  --color-accent-primary:   #00e5ff;
  --color-accent-secondary: #00ff88;
  --color-accent-tertiary:  #7c5cbf;
  --color-text-primary:     #e2ecf5;
  --color-text-secondary:   #7a9bbf;
  --color-text-muted:       #3d5a7a;
  --color-border:           #1e3050;
  --color-border-accent:    rgba(0, 229, 255, 0.3);
  --glow-primary:   0 0 8px rgba(0, 229, 255, 0.4), 0 0 20px rgba(0, 229, 255, 0.15);
  --glow-secondary: 0 0 8px rgba(0, 255, 136, 0.4), 0 0 20px rgba(0, 255, 136, 0.15);
  --glow-subtle:    0 0 4px rgba(0, 229, 255, 0.2);
}
```

- [ ] **Step 2: Rewrite `src/styles/_mixins.scss`**

Remove `terminal-window`, `terminal-dots`, `scanlines`. Update `section-header` to overline+title+hairline pattern.

```scss
// src/styles/_mixins.scss

// Section header: overline (9px uppercase) + bold title + hairline rule
@mixin section-header() {
  margin-bottom: var(--space-6);

  .section-overline {
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin: 0 0 var(--space-2);
    font-family: var(--font-main);
  }

  h2 {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-text-primary);
    font-family: var(--font-main);
    margin: 0;
  }

  &::after {
    content: '';
    display: block;
    height: 1px;
    background: var(--color-border);
    margin-top: var(--space-3);
  }
}

@mixin page-container() {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-7) var(--space-6);

  @include mobile() {
    padding: var(--space-5) var(--space-4);
  }
}

@mixin glow-text($color: var(--color-accent-primary)) {
  color: $color;
}

@mixin hover-lift() {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--glow-primary);
  }
}

@mixin mobile() {
  @media screen and (max-width: 768px) { @content; }
}

@mixin tablet() {
  @media screen and (max-width: 1024px) { @content; }
}
```

- [ ] **Step 3: Rewrite `src/styles.scss`**

Light is the default on `:root`; dark overrides under `[data-theme='dark']`. Switch font from Martian Mono to DM Sans on body.

```scss
// src/styles.scss
@use './styles/tokens' as t;
@use './styles/mixins' as m;
@use '@angular/cdk/overlay-prebuilt.css';

:root {
  @include t.apply-tokens(); // light by default
}

[data-theme='dark'] {
  @include t.apply-tokens();
  @include t.apply-dark-tokens();
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: var(--font-main);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-main);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
  line-height: var(--line-height-tight);
}

p { margin: 0 0 var(--space-4); }

a {
  color: var(--color-accent-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
  &:hover { opacity: 0.8; }
}

button { font-family: var(--font-main); cursor: pointer; }

// Scroll reveal
.reveal {
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  &.revealed { opacity: 1; transform: translateY(0); }
}
.reveal-left {
  opacity: 0; transform: translateX(-20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  &.revealed { opacity: 1; transform: translateX(0); }
}
.stagger-reveal {
  opacity: 0; transform: translateY(14px);
  transition:
    opacity 0.4s ease calc(var(--stagger-index, 0) * 70ms),
    transform 0.4s ease calc(var(--stagger-index, 0) * 70ms);
  &.revealed { opacity: 1; transform: translateY(0); }
}

body.custom-cursor-active * { cursor: none !important; }

// Keyframes (kept for easter egg pages)
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes glitch {
  0%   { clip-path: inset(40% 0 61% 0); transform: translate(-4px, 0); }
  20%  { clip-path: inset(92% 0 1%  0); transform: translate(4px, 0);  }
  40%  { clip-path: inset(43% 0 1%  0); transform: translate(-2px, 0); }
  60%  { clip-path: inset(25% 0 58% 0); transform: translate(2px, 0);  }
  80%  { clip-path: inset(54% 0 7%  0); transform: translate(-1px, 0); }
  100% { clip-path: inset(58% 0 43% 0); transform: translate(0);       }
}
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
.cursor-blink {
  animation: cursorBlink 1s step-end infinite;
  &.hidden { display: none; }
}
```

- [ ] **Step 4: Update `src/index.html` — swap font**

Replace the Martian Mono Google Fonts link with DM Sans:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Paul PERA</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="assets/pictures/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

- [ ] **Step 5: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

Expected: `Build at: ...` with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/styles/ src/index.html
git commit -m "feat: design system — warm stone tokens, DM Sans, light-default theme"
```

---

## Task 2: ThemeService Default + NavComponent Chrome Removal

**Files:**
- Modify: `src/app/services/theme.service.ts`
- Modify: `src/app/layout/nav/nav.component.html`
- Modify: `src/app/layout/nav/nav.component.scss`

- [ ] **Step 1: Flip ThemeService default to light**

In `src/app/services/theme.service.ts`, change `loadTheme()` and `applyTheme()` so light is default and `data-theme='dark'` drives the dark override:

```typescript
private loadTheme(): Theme {
  const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
  return stored === 'dark' ? 'dark' : 'light';  // default: light
}

private applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
```

- [ ] **Step 2: Remove terminal chrome from `nav.component.html`**

Delete the `.nav-chrome` block (the three-dot div + `paul@portfolio:~$` label). Keep everything else identical:

```html
<nav class="nav" [class.open]="isOpen" [class.mobile]="isMobile">

  @if (header()) {
    <div class="nav-identity">
      <div class="nav-name">{{ header()!.name }}&nbsp;<span class="nav-surname">{{ header()!.surname }}</span></div>
      <div class="nav-subtitle">{{ header()!.title }}</div>
    </div>
  }

  <ul class="nav-links">
    @for (link of navLinks; track link.path) {
      <li>
        <a
          [routerLink]="link.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: link.exact }"
          (click)="isMobile && navToggle.emit()"
        >
          <span class="link-prompt">›</span>
          <span class="link-label">{{ link.label | translate }}</span>
        </a>
      </li>
    }
  </ul>

  <div class="nav-spacer"></div>

  <div class="nav-lang">
    <button class="lang-btn" [class.active]="currentLang() === 'fr'" (click)="onLangClick('fr')">FR</button>
    <span class="lang-sep">/</span>
    <button class="lang-btn" [class.active]="currentLang() === 'en'" (click)="onLangClick('en')">EN</button>
  </div>

  <div class="nav-footer">
    <button class="nav-action" (click)="downloadPDF()">
      <span class="action-icon">↓</span>
      <span>CV.pdf</span>
    </button>
    <div class="nav-social">
      <button class="social-btn" (click)="openLinkedIn()" title="LinkedIn">
        <i class="devicon-linkedin-plain"></i>
      </button>
      <button class="social-btn" (click)="openGitHub()" title="GitHub">
        <i class="devicon-github-original"></i>
      </button>
    </div>
  </div>

</nav>
```

- [ ] **Step 3: Rewrite `nav.component.scss`**

Remove all terminal chrome styles (`.nav-chrome`, `.terminal-dots`, `.dot-*`, `.chrome-label`). Update to warm tokens.

```scss
// src/app/layout/nav/nav.component.scss
@use '../../../styles/mixins' as m;

.nav {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: sticky;
  top: 0;
  flex-shrink: 0;

  @include m.mobile() {
    position: fixed;
    left: 0; top: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    box-shadow: 4px 0 24px rgba(80, 60, 20, 0.12);
    &.open { transform: translateX(0); }
  }
}

.nav-identity {
  padding: var(--space-5) var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.nav-name {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.01em;
}

.nav-surname { color: var(--color-accent-primary); }

.nav-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: var(--space-3) 0;
  flex-shrink: 0;

  a {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    letter-spacing: 0.01em;
    border-left: 2px solid transparent;
    text-decoration: none;
    transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);

    &:hover {
      color: var(--color-text-primary);
      background: rgba(184, 147, 90, 0.06);
    }
    &.active {
      color: var(--color-accent-primary);
      border-left-color: var(--color-accent-primary);
      background: rgba(184, 147, 90, 0.08);
    }
  }
}

.link-prompt {
  color: var(--color-accent-primary);
  opacity: 0.5;
  font-size: var(--font-size-lg);
  line-height: 1;
  width: 10px;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);

  a:hover &, a.active & { opacity: 1; }
}

.nav-spacer { flex: 1; }

.nav-lang {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.lang-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-main);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 3px var(--space-2);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover { color: var(--color-text-primary); border-color: var(--color-text-secondary); }
  &.active { color: var(--color-accent-primary); border-color: var(--color-accent-primary); box-shadow: var(--glow-subtle); }
}

.lang-sep { color: var(--color-text-muted); font-size: var(--font-size-xs); }

.nav-footer {
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.nav-action {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-main);
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--color-accent-primary);
    border-color: var(--color-accent-primary);
    box-shadow: var(--glow-subtle);
  }
}

.nav-social { display: flex; gap: var(--space-2); }

.social-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 18px;
  padding: var(--space-1);
  cursor: pointer;
  transition: color var(--transition-fast);

  &:hover { color: var(--color-accent-primary); }
}
```

- [ ] **Step 4: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

Expected: `Build at: ...` with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/theme.service.ts src/app/layout/nav/
git commit -m "feat: light theme default, remove terminal nav chrome"
```

---

## Task 3: Debug Panel — Warm Stone Restyling

**Files:**
- Modify: `src/app/shared/debug-panel/debug-panel.component.html`
- Modify: `src/app/shared/debug-panel/debug-panel.component.scss`

- [ ] **Step 1: Update `debug-panel.component.html`** — remove terminal chrome from header

```html
@if (panel.isOpen()) {
  <div class="debug-panel">
    <div class="debug-header">
      <span class="debug-title">colour debugger</span>
      <button class="debug-close" (click)="panel.isOpen.set(false)">×</button>
    </div>

    <div class="debug-body">
      @for (ctrl of colorControls; track ctrl.property) {
        <div class="color-row">
          <label class="color-label">{{ ctrl.label }}</label>
          <input
            type="color"
            [value]="getColor(ctrl.property)"
            (input)="onColorChange(ctrl.property, $event)"
            class="color-input"
          />
          <span class="color-value">{{ getColor(ctrl.property) }}</span>
        </div>
      }

      <button class="debug-reset" (click)="panel.resetColors()">reset to defaults</button>
    </div>
  </div>
}
```

- [ ] **Step 2: Rewrite `debug-panel.component.scss`** — warm stone, no terminal chrome

```scss
// src/app/shared/debug-panel/debug-panel.component.scss
.debug-panel {
  position: fixed;
  bottom: var(--space-5);
  right: var(--space-5);
  width: 290px;
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: 0 8px 32px rgba(80, 60, 20, 0.18);
  z-index: 10000;
  font-size: var(--font-size-sm);
  font-family: var(--font-main);
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
}

.debug-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.debug-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
  transition: color var(--transition-fast);
  &:hover { color: var(--color-text-primary); }
}

.debug-body { padding: var(--space-3) var(--space-4); }

.color-row {
  display: grid;
  grid-template-columns: 1fr 30px 68px;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-2);
}

.color-label { color: var(--color-text-secondary); font-size: var(--font-size-xs); }

.color-input {
  width: 30px; height: 22px;
  border: 1px solid var(--color-border);
  background: none;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  padding: 1px;
  &:hover { border-color: var(--color-accent-primary); }
}

.color-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.debug-reset {
  width: 100%;
  margin-top: var(--space-3);
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-main);
  font-size: var(--font-size-xs);
  letter-spacing: 0.02em;
  transition: all var(--transition-fast);
  text-align: left;
  &:hover { border-color: var(--color-accent-primary); color: var(--color-accent-primary); }
}
```

- [ ] **Step 3: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/debug-panel/
git commit -m "feat: debug panel warm stone restyling"
```

---

## Task 4: MagneticScrollComponent — Create

**Files:**
- Create: `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`
- Create: `src/app/shared/magnetic-scroll/magnetic-scroll.component.html`
- Create: `src/app/shared/magnetic-scroll/magnetic-scroll.component.scss`
- Modify: `src/assets/data/contentInterface.ts`

- [ ] **Step 1: Add `MagneticScrollItem` to `src/assets/data/contentInterface.ts`**

Append after the existing interfaces:

```typescript
export interface MagneticScrollItem {
  title:        string;
  organisation: string; // company name or school name
  location:     string;
  dateFrom:     string;
  dateTo:       string;
  descriptions: string[];
}
```

- [ ] **Step 2: Create `magnetic-scroll.component.ts`**

```typescript
// src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
import {
  AfterViewInit, Component, ElementRef, inject, Input,
  NgZone, OnChanges, OnDestroy, QueryList, SimpleChanges, ViewChild, ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticScrollItem } from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-magnetic-scroll',
  templateUrl: './magnetic-scroll.component.html',
  styleUrl: './magnetic-scroll.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class MagneticScrollComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: MagneticScrollItem[] = [];

  @ViewChild('stageEl')  stageRef!:  ElementRef<HTMLElement>;
  @ViewChildren('cardEl') cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dotEl')  dotRefs!:  QueryList<ElementRef<HTMLElement>>;

  activeIdx   = 0;
  progress    = 0;

  private readonly PEEK    = 72;    // px visible for adjacent cards
  private readonly TRAVEL  = 160;   // px of scroll = 1 card advance
  private readonly SPRING  = 0.16;  // snap stiffness
  private readonly SNAP_MS = 120;   // ms of silence → snap fires
  private readonly MAX_OVR = 0.15;  // card-units of over-drag allowed

  private expandedH:  number[] = [];
  private collapsedH: number[] = [];
  private raf:        number | null = null;
  private snapTimer:  ReturnType<typeof setTimeout> | null = null;
  private wheelBusy   = false;
  private touchStart: { y: number; progress: number } | null = null;
  private cleanups:   (() => void)[] = [];

  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.measureAllHeights();
      this.render(0);
      this.attachEvents();
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.measureAllHeights();
        this.progress = Math.max(0, Math.min(this.items.length - 1, this.progress));
        this.render(this.progress);
      }));
    }
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.snapTimer) clearTimeout(this.snapTimer);
    this.cleanups.forEach(fn => fn());
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private cards(): HTMLElement[] {
    return this.cardRefs.toArray().map(r => r.nativeElement);
  }

  private dots(): HTMLElement[] {
    return this.dotRefs.toArray().map(r => r.nativeElement);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  // Measure all cards' collapsed + expanded heights in one pass (no visual flash)
  private measureAllHeights(): void {
    const cards = this.cards();
    cards.forEach((card, i) => {
      const body = card.querySelector<HTMLElement>('.ms-body')!;
      body.style.cssText = 'transition:none!important;max-height:0!important;padding:0 20px!important;opacity:0!important;';
      this.collapsedH[i] = card.offsetHeight;
      body.style.cssText = 'transition:none!important;max-height:9999px!important;padding:16px 20px 20px!important;opacity:1!important;';
      this.expandedH[i]  = card.offsetHeight;
      body.style.cssText = '';
    });
  }

  // Measure one card's expanded height before a goTo (captures current content)
  private measureExpandedHeight(card: HTMLElement): number {
    const body = card.querySelector<HTMLElement>('.ms-body')!;
    body.style.transition = 'none';
    body.style.maxHeight  = '9999px';
    body.style.padding    = '16px 20px 20px';
    body.style.opacity    = '1';
    const h = card.offsetHeight;
    body.style.maxHeight = '';
    body.style.padding   = '';
    body.style.opacity   = '';
    requestAnimationFrame(() => { body.style.transition = ''; });
    return h;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  private render(p: number): void {
    const stage   = this.stageRef.nativeElement;
    const cards   = this.cards();
    const stageH  = stage.clientHeight;
    const centre  = stageH / 2;
    const nearest = Math.max(0, Math.min(cards.length - 1, Math.round(p)));

    // Toggle active class and expand body (CSS transition handles animation)
    if (nearest !== this.activeIdx) {
      cards[this.activeIdx]?.classList.remove('ms-active');
      this.dots()[this.activeIdx]?.classList.remove('ms-dot--active');
      this.activeIdx = nearest;
      cards[this.activeIdx]?.classList.add('ms-active');
      this.dots()[this.activeIdx]?.classList.add('ms-dot--active');
    }

    const ah = this.expandedH[nearest] ?? 200;

    cards.forEach((card, i) => {
      const offset    = i - p;
      const absOffset = Math.abs(offset);

      if (absOffset > 1.6) {
        card.style.visibility = 'hidden';
        return;
      }
      card.style.visibility = 'visible';

      // Y: lerp between centre, top-peek, and bottom-peek
      const centreY = centre - ah / 2;
      const topY    = this.PEEK - (this.collapsedH[i] ?? 80);
      const botY    = stageH - this.PEEK;
      const y       = offset <= 0
        ? this.lerp(centreY, topY, -offset)
        : this.lerp(centreY, botY, offset);

      const t       = Math.min(absOffset, 1);
      const opacity = this.lerp(1, 0.38, t);
      const blurPx  = this.lerp(0, 2.5, t);
      const scale   = this.lerp(1, 0.97, t);

      card.style.transform = `translateY(${y}px) scale(${scale})`;
      card.style.opacity   = String(opacity);
      card.style.filter    = `blur(${blurPx}px)`;
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goTo(index: number): void {
    const cards = this.cards();
    index = Math.max(0, Math.min(cards.length - 1, index));
    // Pre-measure expanded height so the card is positioned correctly from frame 1
    this.expandedH[index] = this.measureExpandedHeight(cards[index]);
    this.springTo(index);
  }

  private springTo(target: number): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    const step = () => {
      const diff = target - this.progress;
      if (Math.abs(diff) < 0.003) {
        this.progress = target;
        this.render(this.progress);
        return;
      }
      this.progress += diff * this.SPRING;
      this.render(this.progress);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private snapNearest(): void {
    const max = this.items.length - 1;
    this.springTo(Math.max(0, Math.min(max, Math.round(this.progress))));
  }

  private clamp(p: number): number {
    const max = this.items.length - 1;
    if (p < 0)   return Math.max(-this.MAX_OVR, p * 0.3);
    if (p > max) return Math.min(max + this.MAX_OVR, max + (p - max) * 0.3);
    return p;
  }

  // ── Events ────────────────────────────────────────────────────────────────

  private attachEvents(): void {
    const el = this.stageRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const discrete = e.deltaMode === 1 || Math.abs(e.deltaY) >= 100;
        if (discrete) {
          if (this.wheelBusy) return;
          this.wheelBusy = true;
          const dir = e.deltaY > 0 ? 1 : -1;
          this.ngZone.run(() => this.goTo(Math.round(this.progress) + dir));
          setTimeout(() => { this.wheelBusy = false; }, 450);
        } else {
          if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
          this.progress = this.clamp(this.progress + e.deltaY / this.TRAVEL);
          this.render(this.progress);
          if (this.snapTimer) clearTimeout(this.snapTimer);
          this.snapTimer = setTimeout(() => this.snapNearest(), this.SNAP_MS);
        }
      };

      const onTouchStart = (e: TouchEvent) => {
        if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
        this.touchStart = { y: e.touches[0].clientY, progress: this.progress };
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!this.touchStart) return;
        const dy = this.touchStart.y - e.touches[0].clientY; // positive = swipe up = advance
        this.progress = this.clamp(this.touchStart.progress + dy / this.TRAVEL);
        this.render(this.progress);
      };

      const onTouchEnd = () => {
        this.touchStart = null;
        this.snapNearest();
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: true });
      el.addEventListener('touchend', onTouchEnd, { passive: true });

      this.cleanups.push(
        () => el.removeEventListener('wheel', onWheel),
        () => el.removeEventListener('touchstart', onTouchStart),
        () => el.removeEventListener('touchmove', onTouchMove),
        () => el.removeEventListener('touchend', onTouchEnd),
      );
    });
  }
}
```

- [ ] **Step 3: Create `magnetic-scroll.component.html`**

```html
<!-- src/app/shared/magnetic-scroll/magnetic-scroll.component.html -->
<div class="ms-stage" #stageEl>

  <!-- Edge fades -->
  <div class="ms-fade ms-fade--top"></div>
  <div class="ms-fade ms-fade--bottom"></div>

  <!-- Cards -->
  @for (item of items; track item.title; let i = $index) {
    <div class="ms-card-wrap" #cardEl>
      <div class="ms-card">
        <div class="ms-header" (click)="goTo(i)">
          <p class="ms-overline">{{ item.organisation }} · {{ item.location }}</p>
          <h3 class="ms-title">{{ item.title }}</h3>
          <div class="ms-meta">
            <span class="ms-date">{{ item.dateFrom }} → {{ item.dateTo }}</span>
          </div>
        </div>
        <div class="ms-body">
          <ul>
            @for (desc of item.descriptions; track desc) {
              <li>{{ desc }}</li>
            }
          </ul>
        </div>
      </div>
    </div>
  }

</div>

<!-- Progress dots -->
<div class="ms-dots">
  @for (item of items; track item.title; let i = $index) {
    <div class="ms-dot" #dotEl (click)="goTo(i)"></div>
  }
</div>
```

- [ ] **Step 4: Create `magnetic-scroll.component.scss`**

```scss
// src/app/shared/magnetic-scroll/magnetic-scroll.component.scss
:host {
  display: block;
  position: relative;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
}

.ms-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

// Edge fades — softly clip peeking cards
.ms-fade {
  position: absolute;
  left: 0; right: 52px; // leave room for dots
  height: 80px;
  z-index: 6;
  pointer-events: none;

  &--top {
    top: 0;
    background: linear-gradient(to bottom, var(--color-bg-base) 15%, transparent);
  }
  &--bottom {
    bottom: 0;
    background: linear-gradient(to top, var(--color-bg-base) 15%, transparent);
  }
}

// Card wrappers: absolutely positioned, all driven by JS
.ms-card-wrap {
  position: absolute;
  left: 24px;
  right: 52px;
  top: 0;
  transform: translateY(2000px); // hidden until JS runs
  will-change: transform, opacity, filter;
}

// Card chrome
.ms-card {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: white;
  overflow: hidden;
  transition: box-shadow 0.35s ease, border-color 0.35s ease;
}

.ms-card-wrap.ms-active .ms-card {
  box-shadow: 0 8px 40px rgba(80, 60, 20, 0.13);
  border-color: var(--color-border-accent);
}

// Header — always visible, click to focus
.ms-header {
  padding: 16px 20px 14px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover { background: var(--color-bg-elevated); }
}

.ms-overline {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-1);
}

.ms-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
  line-height: 1.2;
}

.ms-meta { display: flex; align-items: center; }

.ms-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 2px var(--space-2);
}

// Body: collapses/expands via CSS transition (independent from position tracking)
.ms-body {
  max-height: 0;
  overflow: hidden;
  padding: 0 20px;
  opacity: 0;
  transition:
    max-height 0.35s cubic-bezier(.4, 0, .2, 1),
    padding    0.28s ease,
    opacity    0.25s ease 0.03s;
}

.ms-card-wrap.ms-active .ms-body {
  max-height: 400px;
  padding: 16px 20px 20px;
  opacity: 1;
}

.ms-body ul {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ms-body li {
  display: flex;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.55;

  &::before {
    content: '—';
    color: var(--color-accent-primary);
    flex-shrink: 0;
    margin-top: 1px;
  }
}

// Progress dots
.ms-dots {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 7px;
  z-index: 10;
}

.ms-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
  cursor: pointer;
  transition: background 0.25s, transform 0.25s;

  &--active {
    background: var(--color-accent-primary);
    transform: scale(1.5);
  }
}
```

- [ ] **Step 5: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

Expected: `Build at: ...` with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/magnetic-scroll/ src/assets/data/contentInterface.ts
git commit -m "feat: MagneticScrollComponent with continuous position-based animation"
```

---

## Task 5: ExperiencesComponent — Refactor to MagneticScrollComponent

**Files:**
- Modify: `src/app/experiences/experiences.component.ts`
- Modify: `src/app/experiences/experiences.component.html`
- Modify: `src/app/experiences/experiences.component.scss`

- [ ] **Step 1: Rewrite `experiences.component.ts`**

Map `Experiences` data to `MagneticScrollItem[]`. Two signals: `proItems` and `stageItems`.

```typescript
// src/app/experiences/experiences.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Experience, MagneticScrollItem } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
  standalone: true,
  imports: [TranslateModule, MagneticScrollComponent],
})
export class ExperiencesComponent implements OnInit, OnDestroy {
  proItems   = signal<MagneticScrollItem[]>([]);
  stageItems = signal<MagneticScrollItem[]>([]);

  private readonly json     = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getExp().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.proItems.set(data.pro.map((e: Experience) => ({
        title:        e.title,
        organisation: e.company,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      })));
      this.stageItems.set(data.stage.map((e: Experience) => ({
        title:        e.title,
        organisation: e.company,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      })));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

- [ ] **Step 2: Rewrite `experiences.component.html`**

```html
<!-- src/app/experiences/experiences.component.html -->
<div class="exp-page">
  <div class="exp-section">
    <div class="section-header">
      <p class="section-overline">{{ 'EXPERIENCES.OVERLINE' | translate }}</p>
      <h2>{{ 'EXPERIENCES.TITLE' | translate }}</h2>
    </div>
    @if (proItems().length) {
      <app-magnetic-scroll [items]="proItems()" />
    }
  </div>

  <div class="exp-section">
    <div class="section-header">
      <p class="section-overline">{{ 'EXPERIENCES.STAGES_OVERLINE' | translate }}</p>
      <h2>{{ 'EXPERIENCES.INTERNSHIPS' | translate }}</h2>
    </div>
    @if (stageItems().length) {
      <app-magnetic-scroll [items]="stageItems()" />
    }
  </div>
</div>
```

- [ ] **Step 3: Rewrite `experiences.component.scss`**

```scss
// src/app/experiences/experiences.component.scss
@use '../../styles/mixins' as m;

.exp-page {
  display: flex;
  flex-direction: column;
}

.exp-section {
  flex: 1;
}

.section-header {
  @include m.section-header();
  padding: var(--space-5) var(--space-6) 0;

  @include m.mobile() {
    padding: var(--space-4) var(--space-4) 0;
  }
}
```

- [ ] **Step 4: Add translation keys for overlines**

In `src/assets/i18n/fr.json`, add inside the `EXPERIENCES` object:
```json
"OVERLINE": "Expériences",
"STAGES_OVERLINE": "Stages"
```

In `src/assets/i18n/en.json`, add inside the `EXPERIENCES` object:
```json
"OVERLINE": "Experience",
"STAGES_OVERLINE": "Internships"
```

- [ ] **Step 5: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

- [ ] **Step 6: Commit**

```bash
git add src/app/experiences/ src/assets/i18n/
git commit -m "feat: experiences page uses MagneticScrollComponent"
```

---

## Task 6: EducationComponent — Refactor to MagneticScrollComponent

**Files:**
- Modify: `src/app/education/education.component.ts`
- Modify: `src/app/education/education.component.html`
- Modify: `src/app/education/education.component.scss`

- [ ] **Step 1: Rewrite `education.component.ts`**

```typescript
// src/app/education/education.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Education, MagneticScrollItem } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { MagneticScrollComponent } from '../shared/magnetic-scroll/magnetic-scroll.component';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  standalone: true,
  imports: [TranslateModule, MagneticScrollComponent],
})
export class EducationComponent implements OnInit, OnDestroy {
  items = signal<MagneticScrollItem[]>([]);

  private readonly json     = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getEdu().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.items.set(data.map((e: Education) => ({
        title:        e.title,
        organisation: e.school,
        location:     e.location,
        dateFrom:     e.dfrom,
        dateTo:       e.to,
        descriptions: e.descriptions,
      })));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

- [ ] **Step 2: Rewrite `education.component.html`**

```html
<!-- src/app/education/education.component.html -->
<div class="edu-page">
  <div class="section-header">
    <p class="section-overline">{{ 'EDUCATION.OVERLINE' | translate }}</p>
    <h2>{{ 'EDUCATION.TITLE' | translate }}</h2>
  </div>
  @if (items().length) {
    <app-magnetic-scroll [items]="items()" />
  }
</div>
```

- [ ] **Step 3: Rewrite `education.component.scss`**

```scss
// src/app/education/education.component.scss
@use '../../styles/mixins' as m;

.edu-page {
  display: flex;
  flex-direction: column;
}

.section-header {
  @include m.section-header();
  padding: var(--space-5) var(--space-6) 0;

  @include m.mobile() {
    padding: var(--space-4) var(--space-4) 0;
  }
}
```

- [ ] **Step 4: Add translation keys**

In `src/assets/i18n/fr.json`, add inside the `EDUCATION` object:
```json
"OVERLINE": "Formation"
```

In `src/assets/i18n/en.json`, add inside the `EDUCATION` object:
```json
"OVERLINE": "Education"
```

- [ ] **Step 5: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

- [ ] **Step 6: Commit**

```bash
git add src/app/education/ src/assets/i18n/
git commit -m "feat: education page uses MagneticScrollComponent"
```

---

## Task 7: HomepageComponent — Remove Terminal Chrome

**Files:**
- Modify: `src/app/homepage/homepage.component.html`
- Modify: `src/app/homepage/homepage.component.scss`

- [ ] **Step 1: Rewrite `homepage.component.html`**

Remove the terminal chrome bar and `photo-glow` div. Keep the typewriter, `>_ cat profile.txt` easter egg, and meta rows.

```html
<!-- src/app/homepage/homepage.component.html -->
<div class="hero-container">

  @if (header()) {
    <div class="hero-body">
      <div class="hero-photo-col">
        <img class="hero-photo" src="assets/pictures/profileMini.jpg" [alt]="header()!.name" />
      </div>

      <div class="hero-info-col">
        <p class="hero-greeting">Hello, I am</p>
        <h1 class="hero-name">
          {{ header()!.name }}&nbsp;<span class="hero-surname">{{ header()!.surname }}</span>
        </h1>
        <h2 class="hero-title">
          {{ displayedTitle() }}<span class="cursor-blink" [class.hidden]="isTypingDone()">|</span>
        </h2>

        <div class="hero-meta">
          <div class="meta-row">
            <span class="meta-key">location</span>
            <span class="meta-sep">:</span>
            <span class="meta-val">{{ header()!.address }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">phone</span>
            <span class="meta-sep">:</span>
            <a class="meta-val" [href]="'tel:' + header()!.phone">{{ header()!.phone }}</a>
          </div>
          <div class="meta-row">
            <span class="meta-key">mail</span>
            <span class="meta-sep">:</span>
            <a class="meta-val" [href]="'mailto:' + header()!.mail">{{ header()!.mail }}</a>
          </div>
        </div>
      </div>
    </div>
  }

  @if (profile()) {
    <div class="hero-profile" appScrollReveal="reveal">
      <p class="profile-prompt">&gt;_ cat profile.txt</p>
      <p class="profile-text">{{ profile() }}</p>
    </div>
  }

</div>
```

- [ ] **Step 2: Rewrite `homepage.component.scss`**

```scss
// src/app/homepage/homepage.component.scss
@use '../../styles/mixins' as m;

.hero-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-7) var(--space-6) var(--space-8);
  animation: fadeInUp 0.4s ease;

  @include m.mobile() { padding: var(--space-5) var(--space-4); }
}

.hero-body {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--space-6);
  align-items: start;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
  box-shadow: 0 1px 4px rgba(80, 60, 20, 0.06);

  @include m.mobile() {
    grid-template-columns: 1fr;
    padding: var(--space-4);
    gap: var(--space-4);
  }
}

.hero-photo-col { display: flex; justify-content: center; }

.hero-photo {
  width: 140px;
  height: 170px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  display: block;

  @include m.mobile() { width: 100px; height: 120px; }
}

.hero-greeting {
  font-size: var(--font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-2);
}

.hero-name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-2);
  line-height: 1.1;
  color: var(--color-text-primary);
}

.hero-surname {
  color: var(--color-accent-primary);
}

.hero-title {
  font-size: var(--font-size-md);
  font-weight: 400;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-5);
  min-height: 1.4em;
}

.hero-meta { display: flex; flex-direction: column; gap: var(--space-1); }

.meta-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.meta-key {
  color: var(--color-text-muted);
  min-width: 60px;
  font-size: var(--font-size-xs);
  letter-spacing: 0.04em;
}

.meta-sep { color: var(--color-accent-primary); opacity: 0.6; }
.meta-val { color: var(--color-text-secondary); word-break: break-word; }

.hero-profile {
  background: white;
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  padding: var(--space-5) var(--space-6);
  box-shadow: 0 1px 4px rgba(80, 60, 20, 0.06);

  @include m.mobile() { padding: var(--space-4); }
}

.profile-prompt {
  font-size: var(--font-size-xs);
  color: var(--color-accent-secondary);
  margin-bottom: var(--space-3);
  letter-spacing: 0.04em;
  font-family: var(--font-mono);
}

.profile-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
  margin: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

- [ ] **Step 4: Commit**

```bash
git add src/app/homepage/
git commit -m "feat: homepage warm stone, remove terminal chrome"
```

---

## Task 8: Skills Mobile Fix + Passions Token Swap + Section Overlines

**Files:**
- Modify: `src/app/skills/skills.component.html`
- Modify: `src/app/skills/skills.component.scss`
- Modify: `src/app/passions/passions.component.html`
- Modify: `src/app/passions/passions.component.scss`
- Modify: `src/assets/i18n/fr.json`
- Modify: `src/assets/i18n/en.json`

- [ ] **Step 1: Update `skills.component.html`** — add overlines, make level always visible

```html
<!-- src/app/skills/skills.component.html -->
<div class="page-container">

  <div class="section-header">
    <p class="section-overline">{{ 'SKILLS.OVERLINE' | translate }}</p>
    <h2>{{ 'SKILLS.TECH' | translate }}</h2>
  </div>

  @for (category of skillCategories; track category.name; let ci = $index) {
    <div class="skill-directory" appScrollReveal="stagger-reveal" [staggerIndex]="ci">
      <div class="directory-header">
        <span class="dir-name">{{ category.name }}</span>
        <span class="dir-count">{{ category.skills.length }}</span>
      </div>
      <div class="skill-tags">
        @for (skill of category.skills; track skill.lang) {
          <div class="skill-tag" [attr.data-level]="getLevelClass(skill.level)">
            <span class="tag-name">{{ skill.lang }}</span>
            <span class="tag-meta">{{ skill.time }}</span>
            <span class="tag-level">{{ skill.level }}</span>
          </div>
        }
      </div>
    </div>
  }

  <div class="section-header section-header--soft">
    <p class="section-overline">{{ 'SKILLS.SOFT_OVERLINE' | translate }}</p>
    <h2>{{ 'SKILLS.SOFT' | translate }}</h2>
  </div>

  <div class="soft-tags">
    @for (soft of softs; track soft; let si = $index) {
      <span class="soft-tag" appScrollReveal="stagger-reveal" [staggerIndex]="si">{{ soft }}</span>
    }
  </div>

</div>
```

- [ ] **Step 2: Rewrite `skills.component.scss`**

Key change: `.tag-level` is always visible (not hover-only), displayed below the skill name in a smaller muted font.

```scss
// src/app/skills/skills.component.scss
@use '../../styles/mixins' as m;

.page-container { @include m.page-container(); }

.section-header {
  @include m.section-header();
  &--soft { margin-top: var(--space-8); }
}

.skill-directory { margin-bottom: var(--space-5); }

.directory-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding-left: var(--space-3);
  border-left: 2px solid var(--color-accent-primary);
}

.dir-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.01em;
}

.dir-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1px 6px;
  margin-left: auto;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skill-tag {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: white;
  min-width: 80px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
  cursor: default;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--glow-subtle);
  }

  &[data-level='advanced']:hover     { border-color: var(--color-accent-primary); box-shadow: var(--glow-primary); }
  &[data-level='intermediate']:hover { border-color: var(--color-accent-secondary); box-shadow: var(--glow-secondary); }
}

.tag-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.tag-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

// Always visible (mobile fix — no hover needed)
.tag-level {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.soft-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.soft-tag {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: default;
  transition: border-color var(--transition-fast), color var(--transition-fast);

  &:hover { border-color: var(--color-accent-primary); color: var(--color-text-primary); }
}
```

- [ ] **Step 3: Update `passions.component.html`** — add overlines

```html
<!-- src/app/passions/passions.component.html -->
<div class="page-container">

  <div class="section-header">
    <p class="section-overline">{{ 'PASSIONS.SPORTS_OVERLINE' | translate }}</p>
    <h2>{{ 'PASSIONS.SPORTS' | translate }}</h2>
  </div>
  <div class="passion-grid">
    @for (sport of sports; track sport; let i = $index) {
      <div class="passion-tile" appScrollReveal="stagger-reveal" [staggerIndex]="i">
        <span class="passion-glyph">◈</span>
        <span class="passion-name">{{ sport }}</span>
      </div>
    }
  </div>

  <div class="section-header section-header--other">
    <p class="section-overline">{{ 'PASSIONS.OTHERS_OVERLINE' | translate }}</p>
    <h2>{{ 'PASSIONS.OTHERS' | translate }}</h2>
  </div>
  <div class="passion-grid">
    @for (other of others; track other; let i = $index) {
      <div class="passion-tile" appScrollReveal="stagger-reveal" [staggerIndex]="i">
        <span class="passion-glyph">◉</span>
        <span class="passion-name">{{ other }}</span>
      </div>
    }
  </div>

</div>
```

- [ ] **Step 4: Rewrite `passions.component.scss`**

```scss
// src/app/passions/passions.component.scss
@use '../../styles/mixins' as m;

.page-container { @include m.page-container(); }

.section-header {
  @include m.section-header();
  &--other { margin-top: var(--space-8); }
}

.passion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);

  @include m.mobile() { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-2); }
}

.passion-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: white;
  text-align: center;
  cursor: default;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--glow-primary);
    transform: translateY(-2px);
  }
}

.passion-glyph {
  font-size: 1.4rem;
  color: var(--color-accent-primary);
  line-height: 1;
}

.passion-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}
```

- [ ] **Step 5: Add all remaining translation keys**

In `src/assets/i18n/fr.json`:
- Inside `SKILLS`: `"OVERLINE": "Compétences"`, `"SOFT_OVERLINE": "Savoir-être"`
- Inside `PASSIONS`: `"SPORTS_OVERLINE": "Sports"`, `"OTHERS_OVERLINE": "Autres"`

In `src/assets/i18n/en.json`:
- Inside `SKILLS`: `"OVERLINE": "Skills"`, `"SOFT_OVERLINE": "Soft skills"`
- Inside `PASSIONS`: `"SPORTS_OVERLINE": "Sports"`, `"OTHERS_OVERLINE": "Other"`

- [ ] **Step 6: Verify build**

```bash
npx ng build --configuration production 2>&1 | grep -E "error|Error|Build at"
```

Expected: `Build at: ...` with no errors and no budget warnings.

- [ ] **Step 7: Commit**

```bash
git add src/app/skills/ src/app/passions/ src/assets/i18n/
git commit -m "feat: skills mobile fix, passions warm stone, section overlines"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Production build — zero errors**

```bash
npx ng build --configuration production 2>&1 | tail -15
```

Expected output ends with `Build at: ...` and bundle sizes under budget (initial < 1mb).

- [ ] **Step 2: Run dev server**

```bash
npx ng serve --port 4200
```

- [ ] **Step 3: Visual checklist** (open [http://localhost:4200](http://localhost:4200))

Check each route:
- **`/`** — warm background, DM Sans font, no terminal dots, typewriter animates job title, `>_ cat profile.txt` visible before profile text
- **`/experiences`** — magnetic scroll: trackpad follows live, mouse wheel 1 tick = 1 card, spring snaps, adjacent cards blurred/faded at top+bottom edges
- **`/education`** — same magnetic scroll behaviour
- **`/skills`** — overline header, skill level text always visible below tag name (not hover-only), amber left border on categories
- **`/passions`** — overline header, warm tile grid
- **`/doesnotexist`** — terminal 404 easter egg with glitch animation still works
- **Theme toggle (◑ button)** — switches to dark and back, survives refresh
- **Debug panel** — 5 consecutive clicks on FR or EN opens colour picker panel; colours apply live; reset restores defaults
- **Cursor** — amber dot follows mouse, ring expands on hover over buttons/links

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: warm quartz redesign complete — warm stone palette, DM Sans, magnetic scroll"
```
