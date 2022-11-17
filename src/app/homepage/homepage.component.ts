import { Component, OnInit } from '@angular/core';
import { Header } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  profile?: string | undefined;
  header: Header | undefined;

  constructor(private readonly json: GetJsonService) {}

  ngOnInit(): void {
    this.json.getProfile(0)?.subscribe((data) => {
      this.profile = data;
    });
    this.json.getHeader(0)?.subscribe((data) => {
      this.header = data;
    });
  }
}
