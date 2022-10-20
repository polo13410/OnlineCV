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

  constructor(private json: GetJsonService) {}

  ngOnInit(): void {
    this.header = this.json.getHome(0);
  }
}
