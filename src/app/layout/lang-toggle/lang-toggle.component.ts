import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { DebugPanelService } from '../../services/debug-panel.service';
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
  imports: [TranslateModule],
})
export class LangToggleComponent {
  private readonly langService = inject(LanguageService);
  private readonly debugPanel = inject(DebugPanelService);
  readonly lang = toSignal(this.langService.currentLanguage$, { requireSync: true });

  toggle(): void {
    this.langService.setLanguage(this.lang() === 'fr' ? 'en' : 'fr');
    // Easter egg: 5 quick clicks open the debug panel
    this.debugPanel.registerLangButtonClick();
  }
}
