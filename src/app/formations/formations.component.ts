import { Component } from '@angular/core';
import { GetJsonService } from '../get-json.service';
import { Education } from 'src/assets/contentInterface';

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent {
 education?: Education[] = [];

 constructor(private json: GetJsonService) {}

  ngOnInit(): void {
    this.education = this.json.getEdu(0);
  }

}
