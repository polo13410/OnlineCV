import { afterNextRender, inject, Injectable, Injector, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'cv-language';
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'fr';

  // Maps language codes to content.ts array indices
  private readonly LANGUAGE_INDEX_MAP: Record<SupportedLanguage, number> = {
    'fr': 0,
    'en': 1,
  };

  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);

  private currentLanguageSubject: BehaviorSubject<SupportedLanguage>;
  public currentLanguage$: Observable<SupportedLanguage>;

  constructor(private translate: TranslateService) {
    // Initialize with stored language or default
    const storedLang = this.getStoredLanguage();
    this.currentLanguageSubject = new BehaviorSubject<SupportedLanguage>(storedLang);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();

    // Set up ngx-translate
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);
    this.translate.use(storedLang);
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get current language index for content.ts array access
   */
  getCurrentLanguageIndex(): number {
    return this.LANGUAGE_INDEX_MAP[this.currentLanguageSubject.value];
  }

  /**
   * Switch to a specific language
   */
  setLanguage(lang: SupportedLanguage): void {
    // Applied inside a view transition: the page cross-fades and cards (lang-morph mixin)
    // glide to their new size/position. The DOM must be fully re-rendered before the
    // callback resolves, so wait for the translations and the next Angular render.
    const apply = () => this.zone.run(async () => {
      await firstValueFrom(this.translate.use(lang));
      this.currentLanguageSubject.next(lang);
      this.storeLanguage(lang);
      await this.nextRender();
    });

    if (!document.startViewTransition) {
      void apply();
      return;
    }
    document.startViewTransition(apply);
  }

  /** Resolves after Angular's next render (or 500ms, so a missed render never freezes the page). */
  private nextRender(): Promise<void> {
    return new Promise(resolve => {
      afterNextRender(() => resolve(), { injector: this.injector });
      setTimeout(resolve, 500);
    });
  }

  /**
   * Toggle between French and English
   */
  toggleLanguage(): void {
    const newLang: SupportedLanguage =
      this.currentLanguageSubject.value === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }

  /**
   * Get stored language from localStorage
   */
  private getStoredLanguage(): SupportedLanguage {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored === 'en' || stored === 'fr') ? stored : this.DEFAULT_LANGUAGE;
  }

  /**
   * Store language preference in localStorage
   */
  private storeLanguage(lang: SupportedLanguage): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  /**
   * Get language display name for UI
   */
  getLanguageDisplayName(lang: SupportedLanguage): string {
    return lang === 'fr' ? 'Français' : 'English';
  }
}
