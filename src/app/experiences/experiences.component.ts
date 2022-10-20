import { Component } from '@angular/core';
import { GetJsonService } from '../get-json.service';
import { Experience } from 'src/assets/contentInterface'

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss']
})
export class ExperiencesComponent {
  
  experiences?: Experience[]  = [];

  constructor(private json: GetJsonService) {}

  ngOnInit(): void {
    this.experiences = this.json.getExp(0);
  }

}
