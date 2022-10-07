import { Component, Input } from '@angular/core';
import { Experience } from 'src/assets/contentInterface'

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss']
})
export class ExperiencesComponent {
  @Input()
  experiences?: Experience[];

  constructor() { }

  ngOnInit() {
  }

}
