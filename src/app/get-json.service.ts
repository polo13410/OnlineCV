import { Injectable } from '@angular/core';
import { CVDataContent } from 'src/assets/contentInterface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GetJsonService {
  protected cvData: CVDataContent[] = [];

  constructor(private http: HttpClient) {
    this.http
      .get<CVDataContent[]>('/assets/content.json')
      .subscribe((cvData: CVDataContent[]) => {
        this.cvData = cvData;
      });
  }

  getCVData(language: number) {
    return this.cvData[language];
  }

  getExp(language: number) {
    return this.cvData[language]?.experiences;
  }

  getEdu(language: number) {
    return this.cvData[language]?.educations;
  }

  getHeader(language: number) {
    return this.cvData[language]?.header;
  }

  getSkills(language: number) {
    return this.cvData[language]?.skills;
  }

  getProfile(language: number) {
    return this.cvData[language]?.profile;
  }
}
