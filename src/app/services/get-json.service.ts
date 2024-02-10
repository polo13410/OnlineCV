import { Injectable } from '@angular/core';
import { CVDataContent } from 'src/assets/data/contentInterface';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs';
import { content } from '../../assets/data/content'

@Injectable({
  providedIn: 'root',
})
export class GetJsonService {
  protected cvData: CVDataContent[] = [];
  private dataObservable: Observable<CVDataContent[]> | undefined;

  constructor(private readonly http: HttpClient) {
    // this.dataObservable = this.http.get<CVDataContent[]>(
    //   '/assets/data/content.json'
    // );
    // this.cvData = content

    // You can choose to use the data directly or fetch it using HttpClient
    // If you want to fetch using HttpClient (e.g., for remote data), uncomment the next line:
    this.dataObservable = this.http.get<CVDataContent[]>('/assets/data/content.json');

    // If you want to use the data directly (from the TypeScript file), uncomment the next line:
    this.dataObservable = of(content);

    // If you want to combine local and remote data, you can merge the observables:
    // this.dataObservable = this.http.get<CVDataContent[]>('/assets/data/content.json').pipe(
    //   catchError(() => of(content))
    // );

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
        return data[language].skillCategories;
      })
    );
  }

  getSoftSkills(language: number = 0) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].softskills;
      })
    );
  }

  getProfile(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].profile;
      })
    );
  }

  getPassions(language: number) {
    return this.dataObservable?.pipe(
      map((data) => {
        return data[language].passions;
      })
    );
  }

}
