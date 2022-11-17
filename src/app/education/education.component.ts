import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../services/get-json.service';
import { Education } from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss'],
})
export class EducationComponent implements OnInit {
  education?: Education[] = [];

  constructor(private readonly json: GetJsonService) {}

  ngOnInit(): void {
    this.json.getEdu(0)?.subscribe((data) => {
      this.education = data;
    });
  }
}
