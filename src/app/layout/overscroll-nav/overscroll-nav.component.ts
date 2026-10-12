import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, effect, inject, NgZone, signal, untracked } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Page, PageNavigationService } from '../../services/page-navigation.service';

type Edge = 'top' | 'bottom';

/** No wheel event for this long: the gesture (trackpad momentum included) is over. */
const GESTURE_GAP = 200;
/** No input for this long: an unfinished pull springs back. */
const RESET_DELAY = 800;
/** Pull needed to change page, in px of scroll; going back (top) asks for more. */
const WHEEL_THRESHOLD: Record<Edge, number> = { bottom: 240, top: 360 };
const TOUCH_THRESHOLD: Record<Edge, number> = { bottom: 110, top: 160 };
/** Finger travel ignored before a touch pull starts. */
const TOUCH_SLOP = 10;
/** How far the page gives way at full pull. */
const MAX_SHIFT = 44;

/**
 * Overscroll to change page: past the bottom of a page the next one (on the right) is pulled in,
 * past the top the previous one. Only a gesture that starts against the edge pulls, so a scroll
 * (or its momentum) running into the edge never changes page by itself.
 * Progress is written as CSS variables on <html> (--pull, --pull-shift, --pull-transition):
 * the page gives way (shell) and the edge hint fills up.
 */
@Component({
  selector: 'app-overscroll-nav',
  templateUrl: './overscroll-nav.component.html',
  styleUrl: './overscroll-nav.component.scss',
  standalone: true,
  imports: [TranslateModule],
})
export class OverscrollNavComponent {
  /** What the hint shows; kept after a release so it fades out with its label. */
  readonly side = signal<Edge>('bottom');
  readonly target = signal<Page | null>(null);
  readonly ready = signal(false);

  private readonly pageNav = inject(PageNavigationService);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly root = this.document.documentElement;

  /** Edge being pulled, null when idle. */
  private edge: Edge | null = null;
  private pull = 0;
  private lastWheel = -Infinity;
  /** Edges the page was at when the current gesture started. */
  private gestureEdges = new Set<Edge>();
  /** After a page change: the rest of the gesture is eaten (no scroll on the new page). */
  private swallow = false;
  private resetTimer?: ReturnType<typeof setTimeout>;
  private touchY: number | null = null;

  constructor() {
    const onWheel = (e: WheelEvent) => this.onWheel(e);
    const onTouchStart = (e: TouchEvent) => this.onTouchStart(e);
    const onTouchMove = (e: TouchEvent) => this.onTouchMove(e);
    const onTouchEnd = () => this.onTouchEnd();

    this.zone.runOutsideAngular(() => {
      // Not passive: the pull eats the wheel events (no rubber band, no scroll on the new page)
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchEnd);
    });

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      clearTimeout(this.resetTimer);
    });

    // New page: drop the pull at once (the old page, still pulled, was already captured for the slide)
    effect(() => {
      this.pageNav.current();
      untracked(() => this.reset(true));
    });
  }

  private onWheel(e: WheelEvent): void {
    const newGesture = e.timeStamp - this.lastWheel > GESTURE_GAP;
    this.lastWheel = e.timeStamp;
    if (newGesture) {
      this.swallow = false;
      this.gestureEdges = this.edgesReached();
    }
    if (this.swallow) {
      e.preventDefault();
      return;
    }
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || this.isInsideOwnScroller(e.target)) return;

    const delta = e.deltaY * (e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1);
    const edge: Edge = delta > 0 ? 'bottom' : 'top';
    if (!this.canPull(edge)) {
      if (this.edge && this.edge !== edge) this.release();
      return;
    }

    e.preventDefault();
    this.setPull(edge, this.pull + Math.abs(delta), WHEEL_THRESHOLD[edge]);
    if (this.pull >= WHEEL_THRESHOLD[edge]) {
      this.swallow = true;
      this.navigate(edge);
      return;
    }
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.release(), RESET_DELAY);
  }

  private onTouchStart(e: TouchEvent): void {
    clearTimeout(this.resetTimer);
    if (e.touches.length !== 1 || this.isInsideOwnScroller(e.target)) {
      this.touchY = null;
      this.release();
      return;
    }
    this.touchY = e.touches[0].clientY;
    this.gestureEdges = this.edgesReached();
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.touchY === null) return;
    // Finger up = scrolling down = pulling at the bottom
    const travel = this.touchY - e.touches[0].clientY;
    const edge: Edge = travel > 0 ? 'bottom' : 'top';
    const distance = Math.abs(travel) - TOUCH_SLOP;
    if (distance <= 0 || !this.canPull(edge)) {
      if (this.edge) this.release();
      return;
    }
    this.setPull(edge, distance, TOUCH_THRESHOLD[edge]);
  }

  private onTouchEnd(): void {
    if (this.touchY === null) return;
    this.touchY = null;
    const edge = this.edge;
    if (edge && this.pull >= TOUCH_THRESHOLD[edge]) this.navigate(edge);
    else this.release();
  }

  private canPull(edge: Edge): boolean {
    return this.gestureEdges.has(edge) && this.edgesReached().has(edge) && this.neighbor(edge) !== null;
  }

  private neighbor(edge: Edge): Page | null {
    return this.pageNav.neighbor(edge === 'bottom' ? 1 : -1);
  }

  private edgesReached(): Set<Edge> {
    const edges = new Set<Edge>();
    if (window.scrollY <= 1) edges.add('top');
    if (this.root.scrollHeight - Math.ceil(window.scrollY + window.innerHeight) <= 2) edges.add('bottom');
    return edges;
  }

  /** Events inside a scrolling panel, a dialog, the drawer… belong to them, not to the page. */
  private isInsideOwnScroller(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest('.cdk-overlay-container, app-contact-dialog, app-debug-panel, .nav-backdrop, .nav.mobile')) return true;
    for (let el: Element | null = target; el && el !== this.document.body; el = el.parentElement) {
      const overflowY = getComputedStyle(el).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return true;
    }
    return false;
  }

  private setPull(edge: Edge, pull: number, threshold: number): void {
    if (this.edge !== edge) {
      this.edge = edge;
      const target = this.neighbor(edge);
      this.zone.run(() => {
        this.side.set(edge);
        this.target.set(target);
      });
    }
    this.pull = pull;
    const progress = Math.min(pull / threshold, 1);
    const ready = progress >= 1;
    if (this.ready() !== ready) this.zone.run(() => this.ready.set(ready));

    // Resistance: the page gives way less and less as the pull grows
    const shift = MAX_SHIFT * (1 - (1 - progress) ** 2) * (edge === 'bottom' ? -1 : 1);
    this.root.style.setProperty('--pull-transition', '0.12s');
    this.root.style.setProperty('--pull', String(progress));
    this.root.style.setProperty('--pull-shift', `${shift}px`);
  }

  private navigate(edge: Edge): void {
    clearTimeout(this.resetTimer);
    // Going up past the top lands at the bottom of the previous page, as if it sat right above
    this.zone.run(() => edge === 'bottom' ? this.pageNav.go(1) : this.pageNav.go(-1, 'bottom'));
  }

  /** Unfinished pull: spring back. */
  private release(): void {
    this.reset(false);
  }

  private reset(instant: boolean): void {
    clearTimeout(this.resetTimer);
    this.edge = null;
    this.pull = 0;
    this.root.style.setProperty('--pull-transition', instant ? '0s' : '0.35s');
    this.root.style.setProperty('--pull', '0');
    this.root.style.setProperty('--pull-shift', '0px');
    if (this.ready()) this.zone.run(() => this.ready.set(false));
  }
}
