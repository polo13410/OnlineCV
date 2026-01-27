import { Injectable } from '@angular/core';
import { CVDataContent } from 'src/assets/data/contentInterface';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs';
import { content } from '../../assets/data/content';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class GetJsonService {
  protected cvData: CVDataContent[] = [];
  private dataObservable: Observable<CVDataContent[]> | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly languageService: LanguageService
  ) {
    // Using local content data (can switch to HTTP if needed)
    this.dataObservable = of(content);
  }

  /**
   * Helper method to get current language index from LanguageService
   */
  private getCurrentLanguageIndex(): number {
    return this.languageService.getCurrentLanguageIndex();
  }

  /**
   * Get CV data for current language (reactive to language changes)
   */
  getCVData(): Observable<CVDataContent> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()])
        )
      )
    );
  }

  /**
   * Get experiences for current language (reactive to language changes)
   */
  getExp(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].experiences)
        )
      )
    );
  }

  /**
   * Get education for current language (reactive to language changes)
   */
  getEdu(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].educations)
        )
      )
    );
  }

  /**
   * Get header for current language (reactive to language changes)
   */
  getHeader(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].header)
        )
      )
    );
  }

  /**
   * Get skills for current language (reactive to language changes)
   */
  getSkills(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].skillCategories)
        )
      )
    );
  }

  /**
   * Get soft skills for current language (reactive to language changes)
   */
  getSoftSkills(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].softskills)
        )
      )
    );
  }

  /**
   * Get profile for current language (reactive to language changes)
   */
  getProfile(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].profile)
        )
      )
    );
  }

  /**
   * Get passions for current language (reactive to language changes)
   */
  getPassions(): Observable<any> {
    return this.languageService.currentLanguage$.pipe(
      switchMap(() =>
        this.dataObservable!.pipe(
          map((data) => data[this.getCurrentLanguageIndex()].passions)
        )
      )
    );
  }

}
