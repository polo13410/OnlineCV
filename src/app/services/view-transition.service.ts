import { afterNextRender, inject, Injectable, Injector, NgZone } from '@angular/core';

/** Which change is animating — set as `<html data-vt="…">` so CSS can scope each transition. */
export type ViewTransitionKind = 'lang' | 'theme' | 'skills';

/**
 * Wraps a state change in a view transition (see styles.scss). The update runs in Angular's
 * zone and the snapshot of the new state is taken only after Angular re-rendered.
 * Browsers without view transitions just apply the update.
 */
@Injectable({ providedIn: 'root' })
export class ViewTransitionService {
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  private transitionId = 0;

  run(kind: ViewTransitionKind, update: () => void | Promise<void>): void {
    const apply = () => this.zone.run(async () => {
      await update();
      await this.nextRender();
    });

    if (!document.startViewTransition) {
      void apply();
      return;
    }
    const root = document.documentElement;
    const id = ++this.transitionId;
    root.dataset['vt'] = kind;
    document.startViewTransition(apply).finished.finally(() => {
      // A newer transition (even of the same kind) took over: it cleans up after itself
      if (id === this.transitionId && root.dataset['vt'] === kind) delete root.dataset['vt'];
    });
  }

  /** Resolves after Angular's next render (or 500ms, so a missed render never freezes the page). */
  private nextRender(): Promise<void> {
    return new Promise(resolve => {
      afterNextRender(() => resolve(), { injector: this.injector });
      setTimeout(resolve, 500);
    });
  }
}
