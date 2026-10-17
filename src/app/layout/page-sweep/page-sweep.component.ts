import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PAGES, PageNavigationService } from '../../services/page-navigation.service';

/**
 * Light stand-ins for the pages passed over when jumping several pages at once:
 * each one gets its own view-transition name and slides by between the old and new page.
 */
@Component({
  selector: 'app-page-sweep',
  template: `
    @for (s of pageNav.sweep(); track s.index; let k = $index) {
      <div class="sweep-page" [style.view-transition-name]="'page-sweep-' + (k + 1)" aria-hidden="true">
        <div class="sweep-inner">
          <p class="sweep-overline">{{ s.index + 1 | number: '2.0' }} / {{ total | number: '2.0' }}</p>
          <h2 class="sweep-title">{{ s.page.label | translate }}</h2>
          <div class="sweep-lines">
            <span></span><span></span><span></span>
          </div>
          <div class="sweep-card"></div>
          <div class="sweep-card"></div>
        </div>
      </div>
    }
  `,
  styleUrl: './page-sweep.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe, DecimalPipe],
})
export class PageSweepComponent {
  readonly pageNav = inject(PageNavigationService);
  readonly total = PAGES.length;
}
