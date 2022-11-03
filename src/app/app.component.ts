import { Component, OnInit } from '@angular/core'
import { GetJsonService } from './get-json.service'
import { Header } from 'src/assets/contentInterface'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Paul PERA'

  header?: Header
  isExpanded = true
  showSubmenu = false
  isShowing = false
  showSubSubMenu = false

  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.json.getHeader(0)?.subscribe(data =>  {
    this.header = data;
  });
  }

  mouseEnter () {
    if (!this.isExpanded) {
      this.isShowing = true
    }
  }

  mouseLeave () {
    if (!this.isExpanded) {
      this.isShowing = false
    }
  }
}
