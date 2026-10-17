import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

/** FR/EN switch: a pill with a sliding knob, sized like the theme toggle. */
@Component({
  selector: 'app-lang-toggle',
  template: `
    <button
      class="lang-toggle"
      type="button"
      role="switch"
      [class.en]="lang() === 'en'"
      [attr.aria-checked]="lang() === 'en'"
      [attr.aria-label]="'HEADER.LANG' | translate"
      (click)="toggle()"
    >
      <span class="knob" aria-hidden="true"></span>
      <span class="option" [class.active]="lang() === 'fr'">FR</span>
      <span class="option" [class.active]="lang() === 'en'">EN</span>
    </button>
  `,
  styleUrl: './lang-toggle.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe],
})
export class LangToggleComponent {
  private readonly langService = inject(LanguageService);
  readonly lang = toSignal(this.langService.currentLanguage$, { requireSync: true });

  toggle(): void {
    this.langService.setLanguage(this.lang() === 'fr' ? 'en' : 'fr');
  }
}
