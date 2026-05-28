import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Header } from 'src/assets/data/contentInterface';
import { DebugPanelService } from '../../services/debug-panel.service';
import { GetJsonService } from '../../services/get-json.service';
import { GetPdfService } from '../../services/get-pdf.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() isMobile = false;
  @Input() isOpen = true;
  @Output() navToggle = new EventEmitter<void>();

  header = signal<Header | null>(null);
  currentLang = signal<SupportedLanguage>('fr');

  private readonly json = inject(GetJsonService);
  private readonly pdf = inject(GetPdfService);
  private readonly langService = inject(LanguageService);
  private readonly debugPanel = inject(DebugPanelService);
  private readonly destroy$ = new Subject<void>();

  navLinks = [
    { path: '/', label: 'NAV.MENU_TITLE.HOME', exact: true },
    { path: '/experiences', label: 'NAV.MENU_TITLE.EXPERIENCES', exact: false },
    { path: '/education', label: 'NAV.MENU_TITLE.EDUCATION', exact: false },
    { path: '/skills', label: 'NAV.MENU_TITLE.SKILLS', exact: false },
    { path: '/passions', label: 'NAV.MENU_TITLE.PASSIONS', exact: false },
  ];

  ngOnInit(): void {
    this.json.getHeader().pipe(takeUntil(this.destroy$)).subscribe(h => this.header.set(h));
    this.langService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe(l => this.currentLang.set(l));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLangClick(lang: SupportedLanguage): void {
    this.langService.setLanguage(lang);
    this.debugPanel.registerLangButtonClick();
  }

  downloadPDF(): void {
    this.pdf.downloadFile(this.currentLang()).pipe(
      takeUntil(this.destroy$)
    ).subscribe((blob: Blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      a.setAttribute('download', `CV_PaulPERA_${this.currentLang() === 'fr' ? 'FR' : 'EN'}.pdf`);
      a.click();
    });
  }

  openLinkedIn(): void { window.open('https://www.linkedin.com/in/paulpera/', '_blank'); }
  openGitHub(): void { window.open('https://github.com/polo13410', '_blank'); }
}
