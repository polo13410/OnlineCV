import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../get-json.service';
import { Skill } from 'src/assets/contentInterface';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  skills?: Skill[];

  constructor(private json: GetJsonService) {}

  ngOnInit(): void {
    this.skills = this.json.getSkills(0);
  }
}
