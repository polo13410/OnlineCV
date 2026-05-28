import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TypewriterService {
  type(text: string, speed = 55): Observable<string> {
    return new Observable(observer => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        observer.next(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          observer.complete();
        }
      }, speed);
      return () => clearInterval(interval);
    });
  }
}
