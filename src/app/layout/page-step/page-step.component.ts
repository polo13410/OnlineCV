import { booleanAttribute, Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageNavigationService } from '../../services/page-navigation.service';

/**
 * "Scroll to [Previous · <page>]" at the top of a page, "Scroll to [Next · <page>]" at its bottom.
 * Overscrolling that edge fills the button up (OverscrollNavComponent). Nothing past either end.
 */
@Component({
  selector: 'app-page-step',
  templateUrl: './page-step.component.html',
  styleUrl: './page-step.component.scss',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { '[class.previous]': 'step() === -1', '[class.primary]': 'primary()' },
})
export class PageStepComponent {
  /** 1: next page (bottom of the page), -1: previous page (top). */
  readonly step = input.required<1 | -1>();
  /** Replaces "Next · <page>" on the button (translation key). */
  readonly text = input<string>();
  /** Solid accent button (call to action) instead of the outlined pill. */
  readonly primary = input(false, { transform: booleanAttribute });

  readonly pageNav = inject(PageNavigationService);
  readonly page = computed(() => this.pageNav.neighbor(this.step()));
  readonly pulling = computed(() => this.pageNav.pullEdge() === (this.step() === 1 ? 'bottom' : 'top'));
}
