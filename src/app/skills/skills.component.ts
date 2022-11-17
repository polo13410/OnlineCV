import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../services/get-json.service';
import { Skill } from 'src/assets/data/contentInterface';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  skills?: Skill[];
  softs?: string[];
  title = 'Card View Demo';
  gridColumns = 3;

  constructor(private readonly json: GetJsonService) {}
  // constructor (private acRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.json.getSkills(0)?.subscribe((data) => {
      this.skills = data.skill;
      this.softs = data.soft;
    });
  }



  toggleGridColumns() {
    this.gridColumns = this.gridColumns === 3 ? 4 : 3;
  }

}
