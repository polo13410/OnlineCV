import { Component, OnInit, ViewChild } from '@angular/core';
import { GetJsonService } from '../services/get-json.service';
import { Experiences } from 'src/assets/data/contentInterface';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss']
})
export class ExperiencesComponent implements OnInit {
  @ViewChild('accordion',{static:true}) accordion: MatAccordion | undefined
  experiences?: Experiences |undefined
  accordeonToggleIcon?: string |undefined = "unfold_more";
  constructor (private readonly json: GetJsonService) {}

  ngOnInit (): void {
    this.json.getExp(0)?.subscribe(data =>  {
    this.experiences = data;
  });
  }

  toggleAccordeon(){
    if(this.accordeonToggleIcon == "unfold_more"){
      this.accordeonToggleIcon = "unfold_less";
      this.accordion?.openAll()
    } else{
      this.accordeonToggleIcon = "unfold_more";
      this.accordion?.closeAll()
    }
  }

}
