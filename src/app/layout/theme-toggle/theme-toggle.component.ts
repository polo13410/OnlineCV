import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      class="theme-toggle"
      (click)="themeService.toggle()"
      [attr.aria-label]="'Toggle theme'"
      [title]="currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <span class="icon">{{ currentTheme() === 'dark' ? '◑' : '◐' }}</span>
    </button>
  `,
  styleUrl: './theme-toggle.component.scss',
  standalone: true,
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  currentTheme = toSignal(this.themeService.theme$, { initialValue: 'dark' as const });
}
