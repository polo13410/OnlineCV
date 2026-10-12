import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRouteSnapshot, NavigationEnd, Router, ViewTransitionInfo } from '@angular/router';
import { filter } from 'rxjs';

export interface Page {
  path: string;
  label: string;
  icon: string;
  exact: boolean;
}

/** The pages sit side by side in this order, left to right (nav, overscroll and slides follow it). */
export const PAGES: readonly Page[] = [
  { path: '/',            label: 'NAV.MENU_TITLE.HOME',        exact: true,  icon: 'home'       },
  { path: '/experiences', label: 'NAV.MENU_TITLE.EXPERIENCES', exact: false, icon: 'briefcase'  },
  { path: '/projects',    label: 'NAV.MENU_TITLE.PROJECTS',    exact: false, icon: 'folder'     },
  { path: '/education',   label: 'NAV.MENU_TITLE.EDUCATION',   exact: false, icon: 'graduation' },
  { path: '/skills',      label: 'NAV.MENU_TITLE.SKILLS',      exact: false, icon: 'code'       },
  { path: '/passions',    label: 'NAV.MENU_TITLE.PASSIONS',    exact: false, icon: 'heart'      },
];

/** A page passed over during a jump, shown as a light stand-in (see PageSweepComponent). */
export interface SweepPage {
  page: Page;
  index: number;
}

/**
 * Page order and the router's page view transition (see styles.scss): the old page slides out,
 * the stand-ins of the pages in between pass by and the new page slides in, as one strip.
 * Unknown pages (404) get a plain cross-fade.
 */
@Injectable({ providedIn: 'root' })
export class PageNavigationService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /** Index of the page on screen, -1 for a page outside PAGES. */
  readonly current = signal(-1);
  /** Stand-ins rendered during a jump; only set once the old page was captured. */
  readonly sweep = signal<SweepPage[]>([]);

  private pendingSweep: SweepPage[] = [];
  private transitionId = 0;
  /** Page to open at its bottom rather than its top (see go()). */
  private bottomLanding: string | null = null;

  constructor() {
    this.current.set(this.indexOfUrl(this.router.url));
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(e => {
      this.current.set(this.indexOfUrl(e.urlAfterRedirects));
      // NavigationEnd runs inside the transition's update: the stand-ins land in the new state only
      this.sweep.set(this.pendingSweep);
      this.pendingSweep = [];
    });
  }

  /** The page next to the current one (step 1: right, -1: left), null at either end. */
  neighbor(step: 1 | -1): Page | null {
    const i = this.current();
    return i < 0 ? null : PAGES[i + step] ?? null;
  }

  /** landAt 'bottom': the page opens scrolled to its end (overscrolling back from the top continues upward). */
  go(step: 1 | -1, landAt: 'top' | 'bottom' = 'top'): void {
    const page = this.neighbor(step);
    if (!page) return;
    this.bottomLanding = landAt === 'bottom' ? page.path : null;
    void this.router.navigateByUrl(page.path);
  }

  /** Whether the page just navigated to should open at its bottom; asking clears it. */
  takeBottomLanding(url: string): boolean {
    const landing = this.bottomLanding;
    this.bottomLanding = null;
    return landing !== null && this.indexOfUrl(url) === PAGES.findIndex(p => p.path === landing);
  }

  /** withViewTransitions hook: runs right after the transition starts, before the old page is captured. */
  onViewTransition({ transition, from, to }: ViewTransitionInfo): void {
    const fromIndex = this.indexOfSnapshot(from);
    const toIndex = this.indexOfSnapshot(to);
    if (fromIndex === toIndex) {
      transition.skipTransition();
      return;
    }

    const root = this.document.documentElement;
    const slide = fromIndex >= 0 && toIndex >= 0;
    const id = ++this.transitionId;

    root.dataset['vt'] = slide ? 'page' : 'page-fade';
    if (slide) {
      const sign = Math.sign(toIndex - fromIndex);
      const distance = Math.abs(toIndex - fromIndex);
      root.style.setProperty('--vt-sign', String(sign));
      root.style.setProperty('--vt-pages', String(distance));
      // Longer jumps go a bit longer, but stay a quick sweep
      root.style.setProperty('--page-slide-duration', `${Math.min(550 + (distance - 1) * 90, 820)}ms`);
      this.pendingSweep = Array.from({ length: distance - 1 }, (_, k) => {
        const index = fromIndex + sign * (k + 1);
        return { page: PAGES[index], index };
      });
    }

    transition.finished.finally(() => {
      // A newer transition took over: it cleans up after itself
      if (id !== this.transitionId) return;
      if (root.dataset['vt']?.startsWith('page')) delete root.dataset['vt'];
      root.style.removeProperty('--vt-sign');
      root.style.removeProperty('--vt-pages');
      root.style.removeProperty('--page-slide-duration');
      this.sweep.set([]);
    });
  }

  private indexOfSnapshot(snapshot: ActivatedRouteSnapshot): number {
    const route = snapshot.firstChild?.routeConfig;
    return route ? PAGES.findIndex(p => p.path === `/${route.path}`) : -1;
  }

  private indexOfUrl(url: string): number {
    const segment = this.router.parseUrl(url).root.children['primary']?.segments[0]?.path ?? '';
    return PAGES.findIndex(p => p.path === `/${segment}`);
  }
}
