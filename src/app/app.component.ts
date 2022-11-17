import { Component, OnInit } from '@angular/core';
import { GetJsonService } from './services/get-json.service';
import { Header } from 'src/assets/data/contentInterface';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(
    private readonly json: GetJsonService,
    private readonly pdf: GetPdfService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }

  downloadPDF() {
    this.pdf.downloadFile().subscribe((blob: Blob): void => {
      const file = new Blob([blob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank', 'width=1000, height=800');
    });
  }

  popAngular() {
    this.snackBar?.openFromComponent(CodeInfoComponent, {
      duration: 5000,
    });
    return;
  }
}

@Component({
  selector: 'code-info',
  templateUrl: './code-info.html',
})
export class CodeInfoComponent {
  pjson = PackageJson;
  core = `Framework Angular version `;
  gen = ` / projet généré en `;
  genV = `15.0.0`;
  material = `Material Angular version `;
}
