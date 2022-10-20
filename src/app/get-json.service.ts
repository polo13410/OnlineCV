import { Injectable, OnInit } from '@angular/core';
import { CVDataContent } from 'src/assets/contentInterface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})


export class GetJsonService implements OnInit {

  protected cvData: CVDataContent[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http
      .get<CVDataContent[]>('/assets/content.json')
      .subscribe((cvData: CVDataContent[]) => {
        this.cvData = cvData;
      });
  }

  getCVData(language: number) {
    return this.cvData[language];
  }

  getExp(language: number){
    language
    return this.cvData[language]?.experiences
  }

  getEdu(language: number){
    language
    return this.cvData[language]?.educations
  }

  getHome(language: number){
    language
    return this.cvData[language]?.header
  }

  getSkills(language: number){
    language
    return this.cvData[language]?.skills
  }

  getProfile(language: number){
    language
    return this.cvData[language]?.profile
  }

}
