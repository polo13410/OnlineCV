import { Component, OnInit } from '@angular/core';
import { Passion } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-passions',
  templateUrl: './passions.component.html',
  styleUrls: ['./passions.component.scss']
})
export class PassionsComponent implements OnInit {

  passions: Passion[] = [];
  sports: string[] = [];
  others: string[] = [];
  
  constructor(private readonly json: GetJsonService) { }

  ngOnInit(): void {
    this.json.getPassions(0)?.subscribe((data) => {
      data.forEach(element => {
        if(element.type == "sport"){
          this.sports.push(element.name)
        } else {
          this.others.push(element.name)
        }
      });
    });
  }

}
