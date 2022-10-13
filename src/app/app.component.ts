import { Component, OnInit } from '@angular/core';
import { CVDataContent } from 'src/assets/contentInterface';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  protected cvData: CVDataContent[] = [];
  title = 'OnlineCV';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http
      .get<CVDataContent[]>('/assets/content.json')
      .subscribe((cvData: CVDataContent[]) => {
        this.cvData = cvData;
      });
  }


}