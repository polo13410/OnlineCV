import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../get-json.service';
import { CVDataContent, Skill } from 'src/assets/contentInterface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  skills?: Skill[];

  constructor(private readonly acRoute: ActivatedRoute) {

  }
  // constructor (private acRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.acRoute.data.subscribe(({ skills }) =>  {
      this.skills = skills;
    });

  }
}
