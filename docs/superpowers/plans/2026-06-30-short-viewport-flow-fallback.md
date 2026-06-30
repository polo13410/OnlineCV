# Short-Viewport Flow Fallback — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a magnetic-scroll section's tallest card can't fit in the viewport (e.g. 1080p at Windows 150% scaling), fall back to the existing flow (native-scroll) layout so content is never clipped — and switch back when the viewport grows again.

**Architecture:** Add a `tooTall` signal next to the existing `isMobile` signal; a `useFlow = isMobile || tooTall` computed drives the template `@if`. `tooTall` is set by measuring the tallest card against the stage height. Listener wiring (desktop wheel/touch vs flow native scroll) moves from a one-shot `ngAfterViewInit` call to an idempotent `syncLayout()` driven by an `effect` on `useFlow`. A window `resize` handler re-evaluates the fit in both directions.

**Tech Stack:** Angular 21 (standalone, signals, `effect`/`computed`), Karma + Jasmine.

**Spec:** `docs/superpowers/specs/2026-06-30-short-viewport-flow-fallback-design.md`

---

## File Structure

- **Modify** `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts` — add the decision function, the `tooTall`/`useFlow` signals, the reactive `syncLayout()` wiring, and the resize handler.
- **Modify** `src/app/shared/magnetic-scroll/magnetic-scroll.component.html` — switch the layout `@if` from `isMobile()` to `useFlow()`.
- **Create** `src/app/shared/magnetic-scroll/magnetic-scroll.component.spec.ts` — unit-test the pure decision function.

The whole change is contained in one component. No new files of consequence beyond the spec.

---

## Task 1: Pure fit-decision function + unit test

Extract the "does the tallest card overflow the stage?" rule as a pure static method so it can be tested without the DOM.

**Files:**
- Modify: `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`
- Create: `src/app/shared/magnetic-scroll/magnetic-scroll.component.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/shared/magnetic-scroll/magnetic-scroll.component.spec.ts`:

```ts
import { MagneticScrollComponent } from './magnetic-scroll.component';

describe('MagneticScrollComponent.exceedsStage', () => {
  it('returns false when the tallest card fits within the stage minus safety', () => {
    expect(MagneticScrollComponent.exceedsStage(600, 720, 24)).toBe(false);
  });

  it('returns true when the tallest card exceeds the stage minus safety', () => {
    expect(MagneticScrollComponent.exceedsStage(710, 720, 24)).toBe(true);
  });

  it('counts the safety margin as part of the budget', () => {
    // 700 fits in 720 raw, but not in 720 - 24 = 696
    expect(MagneticScrollComponent.exceedsStage(700, 720, 24)).toBe(true);
  });

  it('returns false for a non-positive stage height (not yet measured)', () => {
    expect(MagneticScrollComponent.exceedsStage(700, 0, 24)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: compile/build FAIL — `Property 'exceedsStage' does not exist on type 'typeof MagneticScrollComponent'`.

- [ ] **Step 3: Add the static method**

In `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`, add this method inside the `MagneticScrollComponent` class (e.g. just after the class opening, before the `@Input`):

```ts
  /**
   * True when the tallest card overflows the stage. `safety` reserves a little
   * breathing room so cards are never flush against the stage edges.
   * Returns false when the stage hasn't been measured yet (height <= 0).
   */
  static exceedsStage(
    maxCardHeight: number,
    stageHeight: number,
    safety: number,
  ): boolean {
    if (stageHeight <= 0) return false;
    return maxCardHeight > stageHeight - safety;
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS — 4 specs in the `exceedsStage` describe block green (the rest of the suite also runs and should stay green).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/magnetic-scroll/magnetic-scroll.component.spec.ts src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
git commit -m "feat(magnetic-scroll): add pure card-fit decision function"
```

---

## Task 2: Add `tooTall` / `useFlow` signals and switch the template

Introduce the new state. `tooTall` stays `false` for now, so behaviour is unchanged — this task is purely additive and must leave the app working.

**Files:**
- Modify: `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`
- Modify: `src/app/shared/magnetic-scroll/magnetic-scroll.component.html`

- [ ] **Step 1: Import `computed`**

In the `@angular/core` import block at the top of the `.ts`, add `computed` to the named imports. The block currently is:

```ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  QueryList,
  signal,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
```

Change it to also include `computed` and `effect` (effect is used in Task 3, add both now):

```ts
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  QueryList,
  signal,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
```

- [ ] **Step 2: Add the signals**

Find the existing `isMobile` signal:

```ts
  readonly isMobile = signal(
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false,
  );
```

Immediately after it, add:

```ts
  // True when the tallest card can't fit the stage → fall back to flow layout.
  readonly tooTall = signal(false);

  // The active layout: flow (native scroll) when narrow OR too tall, else cards.
  readonly useFlow = computed(() => this.isMobile() || this.tooTall());
```

- [ ] **Step 3: Switch the template `@if`**

In `src/app/shared/magnetic-scroll/magnetic-scroll.component.html`, change line 3 from:

```html
@if (isMobile()) {
```

to:

```html
@if (useFlow()) {
```

(The `@else` desktop branch and everything else stays untouched.)

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds. Behaviour is unchanged because `tooTall` is always `false` so `useFlow() === isMobile()`.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/magnetic-scroll/magnetic-scroll.component.ts src/app/shared/magnetic-scroll/magnetic-scroll.component.html
git commit -m "feat(magnetic-scroll): add useFlow state driving the layout switch"
```

---

## Task 3: Reactive listener wiring + measurement-driven `tooTall`

Replace the one-shot listener setup with an idempotent `syncLayout()` driven by an `effect` on `useFlow()`. Desktop measurement now sets `tooTall`. This is the core of the fix and the only structural change.

**Files:**
- Modify: `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`

- [ ] **Step 1: Add fields for the fit cache and layout wiring**

Find the existing private fields block:

```ts
  private heights: number[] = [];
  private raf: number | null = null;
  private snapTimer: ReturnType<typeof setTimeout> | null = null;
  private wheelBusy = false;
  private touchStart: { y: number; progress: number } | null = null;
  private cleanups: (() => void)[] = [];

  private ngZone = inject(NgZone);
  private viewReady = false;
```

Replace it with (adds `FIT_SAFETY`, the fit cache, `wiredMode`, `layoutCleanups`, and the `effect`):

```ts
  private readonly FIT_SAFETY = 24;

  private heights: number[] = [];
  private maxCardHeight = 0;
  private lastStageHeight = 0;
  private lastInnerHeight = 0;
  private raf: number | null = null;
  private snapTimer: ReturnType<typeof setTimeout> | null = null;
  private wheelBusy = false;
  private touchStart: { y: number; progress: number } | null = null;
  private cleanups: (() => void)[] = [];
  private layoutCleanups: (() => void)[] = [];
  private wiredMode: 'desktop' | 'flow' | null = null;

  private ngZone = inject(NgZone);
  private viewReady = false;

  // Re-wires listeners and (re)measures whenever the active layout changes.
  private readonly layoutEffect = effect(() => this.syncLayout());
```

- [ ] **Step 2: Simplify `ngAfterViewInit`**

Replace the whole existing `ngAfterViewInit` (which directly attached desktop events and called `scheduleMeasureAndRender`) with this — wiring is now owned by the effect; this method only flattens and registers the global width listener:

```ts
  ngAfterViewInit(): void {
    this.viewReady = true;
    this.flatten();

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(max-width: 768px)');
      const onMqChange = (e: MediaQueryListEvent) => {
        this.ngZone.run(() => this.isMobile.set(e.matches));
      };
      mq.addEventListener('change', onMqChange);
      this.cleanups.push(() => mq.removeEventListener('change', onMqChange));
    }
  }
```

(The window `resize` listener is added in Task 4.)

- [ ] **Step 3: Update `ngOnChanges` to go through `syncLayout`**

Replace the existing `ngOnChanges`:

```ts
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['sections']) return;
    this.flatten();
    if (!this.viewReady) return;
    this.syncLayout();
  }
```

- [ ] **Step 4: Tear down layout listeners on destroy**

Replace the existing `ngOnDestroy`:

```ts
  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.snapTimer) clearTimeout(this.snapTimer);
    this.teardownLayoutListeners();
    this.cleanups.forEach((fn) => fn());
  }
```

- [ ] **Step 5: Replace `scheduleMeasureAndRender` with `syncLayout` + `measureAndDecide` + `teardownLayoutListeners`**

Find and delete the existing `scheduleMeasureAndRender` method:

```ts
  private scheduleMeasureAndRender(): void {
    this.scheduleDoubleRaf(() => {
      if (!this.stageRef || this.flatItems.length === 0) return;
      this.measureAllHeights();
      const max = Math.max(0, this.flatItems.length - 1);
      this.progress = Math.max(0, Math.min(max, this.progress));
      this.render(this.progress);
    });
  }
```

In its place, add these three methods:

```ts
  // Wire the listeners for the active layout (idempotent) and, on desktop,
  // (re)measure to decide whether the section still fits. Deferred a double-RAF
  // so the @if has swapped the DOM and ViewChildren have updated.
  private syncLayout(): void {
    const target: 'desktop' | 'flow' = this.useFlow() ? 'flow' : 'desktop';
    this.scheduleDoubleRaf(() => {
      if (!this.viewReady) return;

      if (this.wiredMode !== target) {
        this.teardownLayoutListeners();
        this.wiredMode = target;
        if (target === 'desktop') {
          this.attachEvents();
        }
        // flow: native scroll only — parity with existing mobile behaviour.
      }

      if (target === 'desktop') {
        this.measureAndDecide();
      }
    });
  }

  // Measure the cards, cache the fit inputs, and flip `tooTall` accordingly.
  private measureAndDecide(): void {
    if (!this.stageRef || this.flatItems.length === 0) return;
    this.measureAllHeights();
    this.maxCardHeight = this.heights.length ? Math.max(...this.heights) : 0;
    const stageH = this.stageRef.nativeElement.clientHeight;
    this.lastStageHeight = stageH;
    this.lastInnerHeight =
      typeof window !== 'undefined' ? window.innerHeight : 0;
    this.tooTall.set(
      MagneticScrollComponent.exceedsStage(
        this.maxCardHeight,
        stageH,
        this.FIT_SAFETY,
      ),
    );
    const max = Math.max(0, this.flatItems.length - 1);
    this.progress = Math.max(0, Math.min(max, this.progress));
    this.render(this.progress);
  }

  private teardownLayoutListeners(): void {
    this.layoutCleanups.forEach((fn) => fn());
    this.layoutCleanups = [];
  }
```

- [ ] **Step 6: Point `attachEvents` cleanups at `layoutCleanups`**

In `attachEvents`, find the final `this.cleanups.push(` call that registers the wheel/touch removers:

```ts
      this.cleanups.push(
        () => el.removeEventListener('wheel', onWheel),
        () => el.removeEventListener('touchstart', onTouchStart),
        () => el.removeEventListener('touchmove', onTouchMove),
        () => el.removeEventListener('touchend', onTouchEnd),
      );
```

Change `this.cleanups.push(` to `this.layoutCleanups.push(` (so these are torn down on every layout switch, not just on destroy):

```ts
      this.layoutCleanups.push(
        () => el.removeEventListener('wheel', onWheel),
        () => el.removeEventListener('touchstart', onTouchStart),
        () => el.removeEventListener('touchmove', onTouchMove),
        () => el.removeEventListener('touchend', onTouchEnd),
      );
```

- [ ] **Step 7: Verify the build and the full test suite**

Run: `npm run build`
Expected: build succeeds.

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS — `exceedsStage` specs still green, existing suite green.

- [ ] **Step 8: Commit**

```bash
git add src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
git commit -m "feat(magnetic-scroll): fall back to flow layout when cards overflow the stage"
```

---

## Task 4: Resize round-trip (switch back when the viewport grows)

Add a `resize` handler so the section returns to card layout when the window gets tall enough again — keeping height behaviour symmetric with the existing width behaviour.

**Files:**
- Modify: `src/app/shared/magnetic-scroll/magnetic-scroll.component.ts`

- [ ] **Step 1: Register the resize listener in `ngAfterViewInit`**

In `ngAfterViewInit`, inside the existing `if (typeof window !== 'undefined') { ... }` block, after the `mq` listener registration, add:

```ts
      const onResize = () => this.ngZone.run(() => this.onViewportResize());
      window.addEventListener('resize', onResize);
      this.cleanups.push(() => window.removeEventListener('resize', onResize));
```

- [ ] **Step 2: Add `onViewportResize`**

Add this method next to `measureAndDecide`:

```ts
  // On resize: when cards are mounted, re-measure directly. When already in flow
  // because of height, the chrome above the stage is fixed-px, so the stage
  // height tracks innerHeight 1:1 — derive it from the cached measurement and
  // re-decide without needing the (unmounted) desktop DOM.
  private onViewportResize(): void {
    if (this.isMobile()) return; // width transitions handled by matchMedia
    if (this.wiredMode === 'desktop') {
      this.measureAndDecide();
    } else {
      const stageH =
        this.lastStageHeight + (window.innerHeight - this.lastInnerHeight);
      this.tooTall.set(
        MagneticScrollComponent.exceedsStage(
          this.maxCardHeight,
          stageH,
          this.FIT_SAFETY,
        ),
      );
    }
  }
```

- [ ] **Step 3: Verify the build and tests**

Run: `npm run build`
Expected: build succeeds.

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
git commit -m "feat(magnetic-scroll): re-evaluate fit on resize for both directions"
```

---

## Task 5: Manual verification

No code changes — confirm the real behaviour in a browser, since the switch depends on DOM measurement that unit tests don't cover.

**Files:** none.

- [ ] **Step 1: Serve the app**

Run: `npm start` (or `npm run watch` + your usual serve) and open the Experiences page.

- [ ] **Step 2: Reproduce the short viewport**

In DevTools, set a responsive viewport of **1280×720** (the effective CSS size of 1080p at Windows 150%). With a desktop width (>768px) and this short height, a content-rich card (e.g. "Technical Lead", ~15 bullets) should now render as a **flowing, natively-scrollable list** — no top/bottom clipping, all bullets reachable.

- [ ] **Step 3: Confirm the round-trips**

- Drag the viewport **taller** (e.g. 1280×1100): it should snap back to the card (magnetic) layout.
- Drag it **shorter** again: back to flow.
- Toggle **FR / EN** (changes card heights): the switch threshold should follow the content with no manual refresh.
- Narrow the width below **768px**: still the flow/mobile layout, as before.

- [ ] **Step 4: Confirm no regression on a tall desktop**

At a normal tall desktop viewport (e.g. 1440×900 or larger), the magnetic card layout, wheel snapping, dots, and arrows behave exactly as before.

---

## Notes / out of scope

- `attachMobileEvents()` remains defined but unused (the flow layout uses plain native scroll). Reviving its blur/scale focus effect is a separate follow-up on its own branch, per the spec — do **not** wire it here.
