import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Header } from 'src/assets/data/contentInterface';
import * as PackageJson from '../../package.json';
import { GetJsonService } from './services/get-json.service';
import { GetPdfService } from './services/get-pdf.service';
import { LanguageService, SupportedLanguage } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    TranslateModule,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'online-cv';
  header?: Header;
  hasDrop = false;
  mdm: MatDrawerMode = 'side';
  currentLang: SupportedLanguage = 'fr';
  private destroy$ = new Subject<void>();

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 960) {
      this.hasDrop = true;
      this.mdm = 'over';
    } else {
      this.hasDrop = false;
      this.mdm = 'side';

    }
  }

  constructor(
    private readonly json: GetJsonService,
    private readonly pdf: GetPdfService,
    private readonly languageService: LanguageService,
    private snackBar: MatSnackBar
  ) {
    this.onResize()
  }

  ngOnInit(): void {
    // Subscribe to header data (now reactive to language changes)
    this.json.getHeader()?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.header = data;
    });

    // Subscribe to language changes for UI updates
    this.languageService.currentLanguage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  downloadPDF() {
    this.pdf.downloadFile(this.currentLang).pipe(
      takeUntil(this.destroy$)
    ).subscribe((blob: Blob): void => {
      const dlButton = document.createElement('a');
      const file = new Blob([blob], { type: 'application/pdf' });
      dlButton.href = URL.createObjectURL(file);
      const langSuffix = this.currentLang === 'fr' ? 'FR' : 'EN';
      dlButton.setAttribute("download", `CV_PaulPERA_${langSuffix}.pdf`);
      dlButton.click();
    });
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  getLanguageLabel(): string {
    return this.currentLang === 'fr' ? 'EN' : 'FR';
  }

  popAngular() {
    this.snackBar?.openFromComponent(CodeInfoComponent, {
      duration: 7000,
    });
    return;
  }

  getScreenSize() { }
}

@Component({
  selector: 'code-info',
  templateUrl: './code-info.html',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
})
export class CodeInfoComponent {
  pjson = PackageJson;
  nodeVersion = '24.x';
}
