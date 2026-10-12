import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, inject, Input, OnChanges, OnDestroy, OnInit, signal, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

export interface TimelineMeta {
  label?: string;
  value: string;
  emphasis?: boolean;
}

export interface TimelineEntry<T = unknown> {
  id: string;
  meta: TimelineMeta[];
  data: T;
}

/** Optional "next chapter" slot shown above the most recent entry. */
export interface TimelineInvite {
  meta: TimelineMeta[];
  title: string;
  text: string;
  cta: { label: string; action: () => void };
  secondary?: { label: string; href: string };
}

const TARGET_HIGHLIGHT_MS = 2000;

/** Zig-zag timeline: meta (dates) and card alternate sides of a centre line. */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  standalone: true,
  imports: [NgTemplateOutlet, ScrollRevealDirective],
})
export class TimelineComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entries: TimelineEntry[] = [];
  @Input() invite?: TimelineInvite;
  @ContentChild(TemplateRef) cardTemplate!: TemplateRef<unknown>;

  readonly targetId = signal<string | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  // Fragment waiting for its entry (entries can arrive after the URL, e.g. once translations load)
  private pendingFragment: string | null = null;

  ngOnInit(): void {
    // A card linked from the skills panel (/experiences#quanthome) is scrolled to and flashed
    this.route.fragment.pipe(takeUntil(this.destroy$)).subscribe(fragment => {
      this.pendingFragment = fragment;
      this.revealFragment();
    });
  }

  ngOnChanges(): void {
    this.revealFragment();
  }

  private revealFragment(): void {
    const fragment = this.pendingFragment;
    if (!fragment || !this.entries.some(e => e.id === fragment)) return;
    this.pendingFragment = null;
    this.timers.push(setTimeout(() => {
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(fragment)?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      this.targetId.set(fragment);
      this.timers.push(setTimeout(() => this.targetId.set(null), TARGET_HIGHLIGHT_MS));
    }));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
