import { DOCUMENT } from '@angular/common';
import { Component, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cursor',
  template: `
    <div class="cursor-dot" [style.left.px]="x()" [style.top.px]="y()" [class.hovering]="hovering()" [class.hidden]="overIframe()"></div>
    <div class="cursor-ring" [style.left.px]="x()" [style.top.px]="y()" [class.hovering]="hovering()" [class.hidden]="overIframe()"></div>
  `,
  styleUrl: './cursor.component.scss',
  standalone: true,
  host: { class: 'cursor-host' },
})
export class CursorComponent implements OnInit, OnDestroy {
  x = signal(0);
  y = signal(0);
  hovering = signal(false);
  // Cross-origin iframes (e.g. Spotify embed) swallow mouse events: the
  // custom cursor can't follow inside, so it fades out and hands off to
  // the OS cursor until the pointer comes back to our document.
  overIframe = signal(false);

  private ngZone = inject(NgZone);
  private document = inject(DOCUMENT);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(this.document, 'mousemove').pipe(
        takeUntil(this.destroy$)
      ).subscribe(e => {
        this.ngZone.run(() => {
          this.x.set(e.clientX);
          this.y.set(e.clientY);
        });
      });

      fromEvent<MouseEvent>(this.document, 'mouseover').pipe(
        takeUntil(this.destroy$)
      ).subscribe(e => {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('a, button, [data-cursor-hover]') !== null;
        const overIframe = target.tagName === 'IFRAME';
        this.ngZone.run(() => {
          this.hovering.set(isInteractive);
          this.overIframe.set(overIframe);
        });
      });
    });

    this.document.body.classList.add('custom-cursor-active');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.document.body.classList.remove('custom-cursor-active');
  }
}
