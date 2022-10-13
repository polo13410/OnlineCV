import { Component, Input } from '@angular/core';
import { Skill } from 'src/assets/contentInterface';
import { AppComponent } from '../app.component'; 

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  @Input() skills?: Skill[];

  constructor(){}

  ngOnInit(): void {

  }

}
