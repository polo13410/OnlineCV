// src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
import { CommonModule } from '@angular/common';
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
import {
  MagneticScrollItem,
  MagneticScrollSection,
} from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-magnetic-scroll',
  templateUrl: './magnetic-scroll.component.html',
  styleUrl: './magnetic-scroll.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class MagneticScrollComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
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

  @Input() sections: MagneticScrollSection[] = [];

  // Desktop refs
  @ViewChild('stageEl') stageRef?: ElementRef<HTMLElement>;
  @ViewChildren('cardEl') cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dotEl') dotRefs!: QueryList<ElementRef<HTMLElement>>;

  // Mobile refs
  @ViewChild('mobileScrollEl') mobileScrollRef?: ElementRef<HTMLElement>;
  @ViewChildren('mobileCardEl') mobileCardRefs!: QueryList<
    ElementRef<HTMLElement>
  >;

  activeIdx = -1;
  activeSection = signal(0);
  canScrollUp = signal(false);
  canScrollDown = signal(false);
  progress = 0;

  flatItems: MagneticScrollItem[] = [];

  // Set before first render so the template @if is correct immediately
  readonly isMobile = signal(
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false,
  );

  // True when the tallest card can't fit the stage → fall back to flow layout.
  readonly tooTall = signal(false);

  // The active layout: flow (native scroll) when narrow OR too tall, else cards.
  readonly useFlow = computed(() => this.isMobile() || this.tooTall());

  private readonly PEEK = 150;
  private readonly TRAVEL = 160;
  private readonly TOUCH_TRAVEL = 320;
  private readonly SPRING = 0.05; // ease-out speed — higher = faster snap
  private readonly SNAP_MS = 120;
  private readonly MAX_OVR = 0.15;

  private readonly FIT_SAFETY = 24;

  private heights: number[] = [];
  // Cached fit inputs — consumed by the resize handler (onViewportResize).
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

      const onResize = () => this.ngZone.run(() => this.onViewportResize());
      window.addEventListener('resize', onResize);
      this.cleanups.push(() => window.removeEventListener('resize', onResize));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['sections']) return;
    this.flatten();
    if (!this.viewReady) return;
    this.syncLayout();
  }

  ngOnDestroy(): void {
    if (this.snapTimer) clearTimeout(this.snapTimer);
    this.teardownLayoutListeners(); // also cancels any in-flight spring RAF
    this.cleanups.forEach((fn) => fn());
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private scheduleDoubleRaf(fn: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  private flatten(): void {
    this.flatItems = this.sections.flatMap((s) => s.items);
  }

  isSectionStart(i: number): boolean {
    return i === 0 || this.sectionForIndex(i) !== this.sectionForIndex(i - 1);
  }

  sectionForIndex(idx: number): number {
    let count = 0;
    for (let i = 0; i < this.sections.length; i++) {
      count += this.sections[i].items.length;
      if (idx < count) return i;
    }
    return Math.max(0, this.sections.length - 1);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  // ── Desktop ───────────────────────────────────────────────────────────────

  private desktopCards(): HTMLElement[] {
    return this.cardRefs?.toArray().map((r) => r.nativeElement) ?? [];
  }

  private desktopDots(): HTMLElement[] {
    return this.dotRefs?.toArray().map((r) => r.nativeElement) ?? [];
  }

  private measureAllHeights(): void {
    this.desktopCards().forEach((card, i) => {
      this.heights[i] = card.offsetHeight;
    });
  }

  // Wire the listeners for the active layout (idempotent) and, on desktop,
  // (re)measure to decide whether the section still fits. Deferred via a
  // double-RAF so the @if has swapped the DOM and ViewChildren have updated.
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

  // On resize: when cards are mounted, re-measure directly. When already in flow
  // because of height, the chrome above the stage is fixed-px, so the stage
  // height tracks innerHeight 1:1 — derive it from the cached measurement and
  // re-decide without needing the (unmounted) desktop DOM.
  private onViewportResize(): void {
    if (this.isMobile()) return; // width transitions handled by matchMedia
    if (this.wiredMode === 'desktop') {
      this.measureAndDecide();
    } else {
      // Also covers wiredMode === null (before the first syncLayout measurement).
      // Skip until the cache is populated, else a cold cache (all zeros) would
      // spuriously flip back to the card layout.
      if (this.lastInnerHeight === 0) return;
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

  private teardownLayoutListeners(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.layoutCleanups.forEach((fn) => fn());
    this.layoutCleanups = [];
  }

  private render(p: number): void {
    const stage = this.stageRef!.nativeElement;
    const cards = this.desktopCards();
    const stageH = stage.clientHeight;
    const centre = stageH / 2;
    const nearest = Math.max(0, Math.min(cards.length - 1, Math.round(p)));

    if (nearest !== this.activeIdx) {
      cards[this.activeIdx]?.classList.remove('ms-active');
      this.desktopDots()[this.activeIdx]?.classList.remove('ms-dot--active');
      this.activeIdx = nearest;
      cards[this.activeIdx]?.classList.add('ms-active');
      this.desktopDots()[this.activeIdx]?.classList.add('ms-dot--active');

      const newSection = this.sectionForIndex(this.activeIdx);
      if (newSection !== this.activeSection())
        this.activeSection.set(newSection);

      this.canScrollUp.set(nearest > 0);
      this.canScrollDown.set(nearest < this.flatItems.length - 1);
    }

    const ah = this.heights[nearest] ?? 200;

    cards.forEach((card, i) => {
      const offset    = i - p;
      const absOffset = Math.abs(offset);

      if (absOffset > 2.4) { card.style.visibility = 'hidden'; return; }
      card.style.visibility = 'visible';

      const centreY = centre - ah / 2;
      const topPeek = this.PEEK - (this.heights[i] ?? 80);  // peek position top edge
      const botPeek = stageH - this.PEEK;                    // peek position bottom edge
      const topExit = -(this.heights[i] ?? 200);             // fully off-screen top
      const botExit = stageH;                                 // fully off-screen bottom

      // 0→1: centre to peek; 1→2: peek to off-screen (slide-away)
      const y = offset <= 0
        ? (offset >= -1 ? this.lerp(centreY, topPeek, -offset) : this.lerp(topPeek, topExit, -offset - 1))
        : (offset <=  1 ? this.lerp(centreY, botPeek,  offset) : this.lerp(botPeek, botExit,  offset - 1));

      card.style.zIndex = String(100 - Math.round(absOffset * 10));

      const t     = Math.min(absOffset, 1);
      const exitT = Math.max(0, absOffset - 1);              // 0 at peek, →1 as card exits
      card.style.transform = `translateY(${y}px) scale(${this.lerp(1, 0.97, t)})`;
      card.style.opacity   = String(this.lerp(this.lerp(1, 0.65, t), 0, exitT));
      card.style.filter    = `blur(${this.lerp(0, 1.5, t)}px)`;
    });
  }

  goTo(index: number): void {
    index = Math.max(0, Math.min(this.flatItems.length - 1, index));
    this.springTo(index);
  }

  goPrev(): void {
    this.goTo(Math.round(this.progress) - 1);
  }
  goNext(): void {
    this.goTo(Math.round(this.progress) + 1);
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
    const max = this.flatItems.length - 1;
    this.springTo(Math.max(0, Math.min(max, Math.round(this.progress))));
  }

  private clamp(p: number): number {
    const max = this.flatItems.length - 1;
    if (p < 0) return Math.max(-this.MAX_OVR, p * 0.3);
    if (p > max) return Math.min(max + this.MAX_OVR, max + (p - max) * 0.3);
    return p;
  }

  private attachEvents(): void {
    const el = this.stageRef?.nativeElement;
    if (!el) return;

    this.ngZone.runOutsideAngular(() => {
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const discrete = e.deltaMode === 1 || Math.abs(e.deltaY) >= 100;
        if (discrete) {
          if (this.wheelBusy) return;
          this.wheelBusy = true;
          const dir = e.deltaY > 0 ? 1 : -1;
          this.ngZone.run(() => this.goTo(Math.round(this.progress) + dir));
          setTimeout(() => {
            this.wheelBusy = false;
          }, 50);
        } else {
          if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
          }
          this.progress = this.clamp(this.progress + e.deltaY / this.TRAVEL);
          this.render(this.progress);
          if (this.snapTimer) clearTimeout(this.snapTimer);
          this.snapTimer = setTimeout(() => this.snapNearest(), this.SNAP_MS);
        }
      };

      const onTouchStart = (e: TouchEvent) => {
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
        this.touchStart = { y: e.touches[0].clientY, progress: this.progress };
      };

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (!this.touchStart) return;
        const dy = this.touchStart.y - e.touches[0].clientY;
        this.progress = this.clamp(
          this.touchStart.progress + dy / this.TOUCH_TRAVEL,
        );
        this.render(this.progress);
      };

      const onTouchEnd = () => {
        this.touchStart = null;
        this.snapNearest();
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd, { passive: true });

      this.layoutCleanups.push(
        () => el.removeEventListener('wheel', onWheel),
        () => el.removeEventListener('touchstart', onTouchStart),
        () => el.removeEventListener('touchmove', onTouchMove),
        () => el.removeEventListener('touchend', onTouchEnd),
      );
    });
  }

  // ── Mobile ────────────────────────────────────────────────────────────────

  private attachMobileEvents(): void {
    const scrollEl = this.mobileScrollRef?.nativeElement;
    if (!scrollEl) return;

    this.ngZone.runOutsideAngular(() => {
      const onScroll = () => {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => this.renderMobile());
      };
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      this.cleanups.push(() =>
        scrollEl.removeEventListener('scroll', onScroll),
      );
    });
  }

  private renderMobile(): void {
    const scrollEl = this.mobileScrollRef?.nativeElement;
    const cards =
      this.mobileCardRefs?.toArray().map((r) => r.nativeElement) ?? [];
    if (!scrollEl || !cards.length) return;

    const viewH = scrollEl.clientHeight;
    const rawCentre = scrollEl.scrollTop + viewH / 2;

    // Clamp to [firstCardCentre, lastCardCentre] so end cards are never blurred
    // just because the user can't scroll further to bring them to the midpoint.
    const firstCentre = cards[0].offsetTop + cards[0].offsetHeight / 2;
    const lastCentre =
      cards[cards.length - 1].offsetTop +
      cards[cards.length - 1].offsetHeight / 2;
    const centre = Math.max(firstCentre, Math.min(lastCentre, rawCentre));

    let closestDist = Infinity;
    let closestIdx = 0;

    cards.forEach((card, i) => {
      const cardCentre = card.offsetTop + card.offsetHeight / 2;
      const dist = Math.abs(cardCentre - centre);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    const newSection = this.sectionForIndex(closestIdx);
    if (newSection !== this.activeSection()) {
      this.ngZone.run(() => this.activeSection.set(newSection));
    }

    cards.forEach((card) => {
      const cardCentre = card.offsetTop + card.offsetHeight / 2;
      const t = Math.min(Math.abs(cardCentre - centre) / (viewH * 0.55), 1);

      card.style.opacity = String(this.lerp(1, 0.5, t));
      card.style.filter = `blur(${this.lerp(0, 2.5, t)}px)`;
      card.style.transform = `scale(${this.lerp(1, 0.96, t)})`;
    });
  }
}
