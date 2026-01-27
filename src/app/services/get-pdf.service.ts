import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GetPdfService {
  constructor(private readonly httpClient: HttpClient) {}

  downloadFile(language: 'fr' | 'en' = 'fr'): Observable<Blob> {
    return this.httpClient.get(`assets/data/pdfVersion-${language}.pdf`, {
      responseType: 'blob',
    });
  }
}
