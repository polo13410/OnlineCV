import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GetJsonService } from './get-json.service';
import { Header } from 'src/assets/contentInterface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('root') root: ElementRef | undefined;
  title = 'Paul PERA';

  header?: Header;

  constructor(private readonly json: GetJsonService, private router: Router) {}

  ngOnInit(): void {
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }

}
