import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GetPdfService {

  constructor(private readonly httpClient: HttpClient) { }

  downloadFile(): Observable<Blob> {
    return this.httpClient.get('assets/pdfVersion.pdf', {responseType: 'blob'});
}

}
