import { Component } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { CursorComponent } from './shared/cursor/cursor.component';
import { DebugPanelComponent } from './shared/debug-panel/debug-panel.component';

@Component({
  selector: 'app-root',
  template: `
    <app-shell />
    <app-cursor />
    <app-debug-panel />
  `,
  standalone: true,
  imports: [ShellComponent, CursorComponent, DebugPanelComponent],
})
export class AppComponent {}
