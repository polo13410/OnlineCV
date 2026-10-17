import { afterNextRender, Component, inject, Injector, signal, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NavComponent } from '../nav/nav.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ContactService } from '../../services/contact.service';
import { PageNavigationService } from '../../services/page-navigation.service';
import { ContactDialogComponent } from '../../shared/contact-dialog/contact-dialog.component';
import { HeaderLinksComponent } from '../header-links/header-links.component';
import { LangToggleComponent } from '../lang-toggle/lang-toggle.component';
import { PageStepComponent } from '../page-step/page-step.component';
import { OverscrollNavComponent } from '../overscroll-nav/overscroll-nav.component';
import { PageSweepComponent } from '../page-sweep/page-sweep.component';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule, TranslatePipe, NavComponent, ThemeToggleComponent, ContactDialogComponent, HeaderLinksComponent, LangToggleComponent, OverscrollNavComponent, PageStepComponent, PageSweepComponent],
})
export class ShellComponent {
  private breakpoints = inject(BreakpointObserver);
  readonly contact = inject(ContactService);
  readonly pageNav = inject(PageNavigationService);

  isMobile = toSignal(
    this.breakpoints.observe('(max-width: 768px)').pipe(map(r => r.matches)),
    { initialValue: false }
  );

  isMobileNavOpen = signal(false);

  constructor() {
    // The window is the scroll container: start each page at the top, or at its bottom when
    // overscrolling back to it. Fragment links (/experiences#quanthome) are scrolled by the timeline itself.
    const router = inject(Router);
    const pageNav = this.pageNav;
    const injector = inject(Injector);
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      filter(e => !router.parseUrl(e.urlAfterRedirects).fragment),
      takeUntilDestroyed(),
    ).subscribe(e => {
      if (!pageNav.takeBottomLanding(e.urlAfterRedirects)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      // Once the new page is rendered (its height known), still before the slide captures it
      afterNextRender(
        () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
        { injector },
      );
    });
  }

  toggleNav(): void {
    this.isMobileNavOpen.update(v => !v);
  }

  closeNav(): void {
    this.isMobileNavOpen.set(false);
  }

  // Must return void: a (click) expression evaluating to `false`
  // makes Angular call preventDefault(), cancelling link navigation
  // for every click bubbling through the content area.
  onContentClick(): void {
    if (this.isMobile() && this.isMobileNavOpen()) {
      this.closeNav();
    }
  }
}
