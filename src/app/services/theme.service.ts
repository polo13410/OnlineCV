import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ViewTransitionService } from './view-transition.service';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'cv-theme';
  private readonly viewTransition = inject(ViewTransitionService);
  private themeSubject = new BehaviorSubject<Theme>(this.loadTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get current(): Theme {
    return this.themeSubject.value;
  }

  toggle(): void {
    const next: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    // The whole page cross-fades to the new palette
    this.viewTransition.run('theme', () => {
      this.themeSubject.next(next);
      localStorage.setItem(this.STORAGE_KEY, next);
      this.applyTheme(next);
    });
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    return stored === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
