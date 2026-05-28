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

  activeIdx   = -1;  // -1 so first render(0) triggers the active class toggle on card 0
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
