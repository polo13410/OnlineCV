import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GetJsonService } from './get-json.service';
import { Header } from 'src/assets/contentInterface';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { GetPdfService } from './get-pdf.service';
import PackageJson from '../../package-lock.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('root') root: ElementRef | undefined;
  title = 'Paul PERA';

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

  socialAction(direction: string = 'github') {
    if (direction == 'linkedin') {
      window.open('https://www.linkedin.com/in/paulpera/', '_blank');
      return;
    } else if (direction == 'angular') {
      
      this.snackBar?.openFromComponent(CodeInfoComponent, {
        duration: 5000
      } );
      return;
    } else if (direction == 'github') {
      window.open('https://github.com/polo13410', '_blank');

      return;
    }
  }
}

@Component({
  selector: 'code-info',
  templateUrl: 'code-info.html',
})
export class CodeInfoComponent {
  core =
    `Framework Angular version ` +
    PackageJson.dependencies['@angular/core'].version +
    ` (projet généré en 14.2.4)`;
  material =
    `Material Angular version ` +
    PackageJson.dependencies['@angular/material'].version;
}
