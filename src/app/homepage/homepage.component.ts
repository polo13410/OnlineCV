import { Component, OnInit } from '@angular/core'
import { GetJsonService } from '../get-json.service'

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  education?: string | undefined

  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.json.getProfile(0)?.subscribe(data =>  {
      this.education = data;
    });
  }
}
