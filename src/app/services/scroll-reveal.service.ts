import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollRevealService {
  private observer: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();

  constructor() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cb = this.callbacks.get(entry.target);
            if (cb) {
              cb();
              this.observer.unobserve(entry.target);
              this.callbacks.delete(entry.target);
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
  }

  observe(el: Element, callback: () => void): void {
    this.callbacks.set(el, callback);
    this.observer.observe(el);
  }

  unobserve(el: Element): void {
    this.observer.unobserve(el);
    this.callbacks.delete(el);
  }
}
