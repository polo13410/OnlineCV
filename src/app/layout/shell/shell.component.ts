import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NavComponent } from '../nav/nav.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { TranslateModule } from '@ngx-translate/core';
import { ContactService } from '../../services/contact.service';
import { ContactDialogComponent } from '../../shared/contact-dialog/contact-dialog.component';
import { HeaderLinksComponent } from '../header-links/header-links.component';
import { LangToggleComponent } from '../lang-toggle/lang-toggle.component';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  standalone: true,
  imports: [RouterModule, TranslateModule, NavComponent, ThemeToggleComponent, ContactDialogComponent, HeaderLinksComponent, LangToggleComponent],
})
export class ShellComponent {
  private breakpoints = inject(BreakpointObserver);
  readonly contact = inject(ContactService);

  isMobile = toSignal(
    this.breakpoints.observe('(max-width: 768px)').pipe(map(r => r.matches)),
    { initialValue: false }
  );

  isMobileNavOpen = signal(false);

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
