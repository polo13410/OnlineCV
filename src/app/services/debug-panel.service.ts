import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Theme, ThemeService } from './theme.service';

type ColorOverrides = Record<string, string>;

/** Colour debugger: overrides are kept per theme and only the active theme's are applied. */
@Injectable({ providedIn: 'root' })
export class DebugPanelService {
  private readonly STORAGE_KEY = 'cv-debug-colors';
  isOpen = signal(false);

  private clickCounter = 0;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;

  readonly theme = toSignal(inject(ThemeService).theme$, { requireSync: true });
  private readonly overrides = signal<Record<Theme, ColorOverrides>>(this.loadColors());
  /** Overrides of the active theme */
  readonly colorState = computed(() => this.overrides()[this.theme()]);

  constructor() {
    // Re-apply on theme switch: drop the other theme's overrides, apply this one's
    effect(() => {
      const root = document.documentElement.style;
      const all = this.overrides();
      Object.values(all).forEach(colors => Object.keys(colors).forEach(k => root.removeProperty(k)));
      Object.entries(all[this.theme()]).forEach(([k, v]) => root.setProperty(k, v));
    });
  }

  /** Easter egg: 5 quick clicks on the theme toggle open the colour debugger. */
  registerThemeButtonClick(): void {
    this.clickCounter++;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => { this.clickCounter = 0; }, 2000);

    if (this.clickCounter >= 5) {
      this.clickCounter = 0;
      this.isOpen.update(v => !v);
    }
  }

  updateColor(property: string, value: string): void {
    const theme = this.theme();
    this.overrides.update(all => ({ ...all, [theme]: { ...all[theme], [property]: value } }));
    this.saveColors();
  }

  resetColors(): void {
    this.overrides.set({ light: {}, dark: {} });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadColors(): Record<Theme, ColorOverrides> {
    try {
      const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '{}');
      // Saved before overrides were per theme: one flat map, applied to both themes
      if (!stored.light && !stored.dark) return { light: { ...stored }, dark: { ...stored } };
      return { light: stored.light ?? {}, dark: stored.dark ?? {} };
    } catch { return { light: {}, dark: {} }; }
  }

  private saveColors(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.overrides()));
  }
}
