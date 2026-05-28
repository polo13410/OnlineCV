// src/app/shared/magnetic-scroll/magnetic-scroll.component.ts
import {
  AfterViewInit, Component, ElementRef, inject, Input,
  NgZone, OnChanges, OnDestroy, QueryList, signal, SimpleChanges, ViewChild, ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticScrollItem, MagneticScrollSection } from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-magnetic-scroll',
  templateUrl: './magnetic-scroll.component.html',
  styleUrl: './magnetic-scroll.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class MagneticScrollComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() sections: MagneticScrollSection[] = [];

  @ViewChild('stageEl')  stageRef!:  ElementRef<HTMLElement>;
  @ViewChildren('cardEl') cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dotEl')  dotRefs!:  QueryList<ElementRef<HTMLElement>>;

  activeIdx     = -1;  // -1 so first render(0) applies .ms-active to card 0
  activeSection = signal(0);
  progress      = 0;

  // Flattened items across all sections — used in the template
  flatItems: MagneticScrollItem[] = [];

  private readonly PEEK    = 72;
  private readonly TRAVEL  = 160;
  private readonly SPRING  = 0.16;
  private readonly SNAP_MS = 120;
  private readonly MAX_OVR = 0.15;

  private expandedH:  number[] = [];
  private collapsedH: number[] = [];
  private raf:        number | null = null;
  private snapTimer:  ReturnType<typeof setTimeout> | null = null;
  private wheelBusy   = false;
  private touchStart: { y: number; progress: number } | null = null;
  private cleanups:   (() => void)[] = [];

  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    this.flatten();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.measureAllHeights();
      this.render(0);
      this.attachEvents();
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] && !changes['sections'].firstChange) {
      this.flatten();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.measureAllHeights();
        this.progress = Math.max(0, Math.min(this.flatItems.length - 1, this.progress));
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

  private flatten(): void {
    this.flatItems = this.sections.flatMap(s => s.items);
  }

  // Map a flat item index to its section index
  private sectionForIndex(idx: number): number {
    let count = 0;
    for (let i = 0; i < this.sections.length; i++) {
      count += this.sections[i].items.length;
      if (idx < count) return i;
    }
    return Math.max(0, this.sections.length - 1);
  }

  private cards(): HTMLElement[] {
    return this.cardRefs.toArray().map(r => r.nativeElement);
  }

  private dots(): HTMLElement[] {
    return this.dotRefs.toArray().map(r => r.nativeElement);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

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

    if (nearest !== this.activeIdx) {
      cards[this.activeIdx]?.classList.remove('ms-active');
      this.dots()[this.activeIdx]?.classList.remove('ms-dot--active');
      this.activeIdx = nearest;
      cards[this.activeIdx]?.classList.add('ms-active');
      this.dots()[this.activeIdx]?.classList.add('ms-dot--active');

      // Update active section when crossing a section boundary
      const newSection = this.sectionForIndex(this.activeIdx);
      if (newSection !== this.activeSection()) {
        this.activeSection.set(newSection);
      }
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
    const max = this.flatItems.length - 1;
    this.springTo(Math.max(0, Math.min(max, Math.round(this.progress))));
  }

  private clamp(p: number): number {
    const max = this.flatItems.length - 1;
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
        const dy = this.touchStart.y - e.touches[0].clientY;
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
