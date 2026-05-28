import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DebugPanelService {
  private readonly STORAGE_KEY = 'cv-debug-colors';
  isOpen = signal(false);

  private clickCounter = 0;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;

  colorState = signal<Record<string, string>>(this.loadColors());

  registerLangButtonClick(): void {
    this.clickCounter++;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => { this.clickCounter = 0; }, 2000);

    if (this.clickCounter >= 5) {
      this.clickCounter = 0;
      this.isOpen.update(v => !v);
    }
  }

  updateColor(property: string, value: string): void {
    document.documentElement.style.setProperty(property, value);
    this.colorState.update(state => ({ ...state, [property]: value }));
    this.saveColors();
  }

  resetColors(): void {
    Object.keys(this.colorState()).forEach(k =>
      document.documentElement.style.removeProperty(k)
    );
    this.colorState.set({});
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadColors(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const colors: Record<string, string> = stored ? JSON.parse(stored) : {};
      Object.entries(colors).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, v)
      );
      return colors;
    } catch { return {}; }
  }

  private saveColors(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.colorState()));
  }
}
