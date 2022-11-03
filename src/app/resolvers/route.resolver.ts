import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { GetJsonService } from '../get-json.service';

@Injectable()
export class RouteResolver implements Resolve<any> {
  constructor(private jsonService: GetJsonService) {

  }

  resolve() {
    console.log('1 : route resolve begin');
    return this.jsonService.getSkills();
    // return forkJoin(this.jsonService.getSkills(0),
    //   this.jsonService.getExp(0)
    //   )
  }
}
