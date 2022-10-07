import { Component, Input } from '@angular/core';
import { Education } from 'src/assets/contentInterface'; 

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.scss']
})
export class FormationsComponent  {
  @Input() cvFormations?: Education[] = []

  constructor() { }

  ngOnInit(): void {
  }

}
