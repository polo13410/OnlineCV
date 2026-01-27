import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatDrawerMode } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetJsonService } from './services/get-json.service';
import { Header } from 'src/assets/data/contentInterface';
import { GetPdfService } from './services/get-pdf.service';
import { Subject, takeUntil } from 'rxjs';
import * as PackageJson from '../../package.json';

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
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'online-cv';
  header?: Header;
  hasDrop = false;
  mdm: MatDrawerMode = 'side';
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
    private snackBar: MatSnackBar
  ) {
    this.onResize()
  }

  ngOnInit(): void {
    this.json.getHeader(0)?.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.header = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  downloadPDF() {
    this.pdf.downloadFile().pipe(
      takeUntil(this.destroy$)
    ).subscribe((blob: Blob): void => {
      const dlButton = document.createElement('a');
      const file = new Blob([blob], { type: 'application/pdf' });
      dlButton.href = URL.createObjectURL(file);
      dlButton.setAttribute("download", "CV_PaulPERA.pdf");
      dlButton.click();
    });
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
  imports: [CommonModule, MatIconModule],
})
export class CodeInfoComponent {
  pjson = PackageJson;
  core = `Angular version `;
  node = `Node deployment version`;
  nodev = `20.11.0`;
}
