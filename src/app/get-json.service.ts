import { Injectable } from '@angular/core';
import { CVDataContent } from 'src/assets/contentInterface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetJsonService {
  protected cvData: CVDataContent[] = [];
  private dataObservable: Observable<CVDataContent[]> | undefined;

  constructor(private readonly http: HttpClient) {
    console.log('0 : Fetching data from json');
    this.dataObservable = this.http.get<CVDataContent[]>(
      '/assets/content.json'
    );
    // .subscribe((cvData: CVDataContent[]) => {
    //   this.cvData = cvData
    // });

    console.log('0 : LOADED from json', this.cvData);
  }

  getCVData(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language];
      })
    );
  }

  getExp(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].experiences;
      })
    );
  }

  getEdu(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].educations;
      })
    );
  }

  getHeader(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].header;
      })
    );
  }

  getSkills(language: number = 0) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].skills;
      })
    );
    // return this.cvData[language]?.skills
  }

  getProfile(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].profile;
      })
    );
  }
}
