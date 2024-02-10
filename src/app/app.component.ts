import { Component, OnInit, HostListener } from '@angular/core';
import { GetJsonService } from './services/get-json.service';
import { Header } from 'src/assets/data/contentInterface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDrawerMode } from '@angular/material/sidenav';
import { GetPdfService } from './services/get-pdf.service';
import * as PackageJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'online-cv';
  header?: Header;
  hasDrop = false;
  mdm: MatDrawerMode = 'side';

  @HostListener('window:resize', ['$event'])
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
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }

  downloadPDF() {
    this.pdf.downloadFile().subscribe((blob: Blob): void => {
      const dlButton = document.createElement('a');
      const file = new Blob([blob], { type: 'application/pdf' });
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL, '_blank');
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
})
export class CodeInfoComponent {
  pjson = PackageJson;
  core = `Angular version `;
  node = `Node deployment version`;
  nodev = `20.11.0`;
}
