import { Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { GITHUB_URL, LINKEDIN_URL } from '../../shared/contact';

/** CV download and/or social links — shown in the top bar on desktop, in the mobile drawer otherwise. */
@Component({
  selector: 'app-header-links',
  template: `
    @if (show === 'cv' || show === 'all') {
      <a
        class="cv-btn"
        [href]="'assets/data/pdfVersion-' + lang() + '.pdf'"
        [attr.download]="'CV_PaulPERA_' + lang().toUpperCase() + '.pdf'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>{{ 'HEADER.CV' | translate }}</span>
      </a>
    }
    @if (show === 'social' || show === 'all') {
      <span class="social">
        <a class="social-btn" [href]="linkedin" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">
          <i class="devicon-linkedin-plain" aria-hidden="true"></i>
        </a>
        <a class="social-btn" [href]="github" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
          <i class="devicon-github-original" aria-hidden="true"></i>
        </a>
      </span>
    }
  `,
  styleUrl: './header-links.component.scss',
  standalone: true,
  imports: [TranslateModule],
})
export class HeaderLinksComponent {
  @Input() show: 'cv' | 'social' | 'all' = 'all';
  readonly lang = toSignal(inject(LanguageService).currentLanguage$, { requireSync: true });
  readonly linkedin = LINKEDIN_URL;
  readonly github = GITHUB_URL;
}
