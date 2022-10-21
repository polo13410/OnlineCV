import { Component } from '@angular/core';
import { GetJsonService } from './get-json.service';
import { Header } from 'src/assets/contentInterface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Paul PERA';

  header?: Header;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

  constructor(private json: GetJsonService) {}

  ngOnInit(): void {
    this.header = this.json.getHeader(0);
    console.log(this.header);
  }

  mouseEnter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseLeave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

}
