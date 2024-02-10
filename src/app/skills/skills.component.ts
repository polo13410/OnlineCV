import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../services/get-json.service';
import { SkillCategory } from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  skillCategories?: SkillCategory[];
  softs?: string[];
  title = 'SkillComponent';
  gridColumns = 3;

  constructor(private readonly json: GetJsonService) { }

  ngOnInit(): void {
    this.json.getSkills(0)?.subscribe((data) => {
      this.skillCategories = data;
    });
    this.json.getSoftSkills(0)?.subscribe((data) => {
      this.softs = data;
    });
  }
}
