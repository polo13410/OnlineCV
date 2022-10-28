import { Component, OnInit } from '@angular/core'
import { GetJsonService } from '../get-json.service'
import { Education } from 'src/assets/contentInterface'

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent implements OnInit {
  education?: Education[] = []

  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.education = this.json.getEdu(0)
  }
}
