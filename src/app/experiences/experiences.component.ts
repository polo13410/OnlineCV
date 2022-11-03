import { Component, OnInit } from '@angular/core'
import { GetJsonService } from '../get-json.service'
import { Experience } from 'src/assets/contentInterface'

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss']
})
export class ExperiencesComponent implements OnInit {
  experiences?: Experience[] = []

  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.json.getExp(0)?.subscribe(data =>  {
    this.experiences = data;
  });
  }
}
