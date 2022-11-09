import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GetJsonService } from './get-json.service';
import { Header } from 'src/assets/contentInterface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetPdfService } from './get-pdf.service';

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
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }

  downloadPDF(){
    this.pdf.downloadFile()
    .subscribe((blob: Blob): void => {
      const file = new Blob([blob], {type: 'application/pdf'});
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank', 'width=1000, height=800');
    });
  }

  socialAction(direction: string = 'github') {
    if (direction == 'linkedin') {
      window.open('https://www.linkedin.com/in/paulpera/', '_blank');
      return;
    } else if (direction == 'angular') {
      this.snackBar?.open(
        'Développé avec le framework Angular v14.2.0',
        'OK'
      );
      return;
    } else if (direction == 'github') {
      window.open('https://github.com/polo13410', '_blank');
      
      return;
    }
  }
}
