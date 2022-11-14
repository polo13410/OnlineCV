import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GetJsonService } from './get-json.service';
import { Header } from 'src/assets/contentInterface';
import { Router, RouterOutlet } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { GetPdfService } from './get-pdf.service';
import PackageJson from '../../package-lock.json';
import { animate, query, style, transition, trigger } from '@angular/animations';


const fade = [
  query(':self', 
    [
      style({ opacity: 0 })
    ], 
    { optional: true }
  ),

  query(':self',
    [
      style({ opacity: 0 }),
      animate('.3s', style({ opacity: 1 }))
    ], 
    { optional: true }
  )
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routerAnimations', [
      transition('* => *', fade)
    ])
  ]
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

  popAngular() { 
      this.snackBar?.openFromComponent(CodeInfoComponent, {
        duration: 5000,
      });
      return;
    
  }

  prepareRouteTransition(outlet: RouterOutlet) {
    const animation = outlet.activatedRouteData['animation'] || {};
    return animation['value'] || null;
  }

}

@Component({
  selector: 'code-info',
  templateUrl: 'code-info.html',
})
export class CodeInfoComponent {
  pjson = PackageJson;
  core = `Framework Angular version `;
  gen = ` / projet généré en `;
  genV = `14.2.4`;
  material = `Material Angular version `;
}
