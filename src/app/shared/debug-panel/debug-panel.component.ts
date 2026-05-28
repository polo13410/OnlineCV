import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DebugPanelService } from '../../services/debug-panel.service';

interface ColorControl {
  label: string;
  property: string;
}

@Component({
  selector: 'app-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrl: './debug-panel.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DebugPanelComponent {
  panel = inject(DebugPanelService);

  colorControls: ColorControl[] = [
    { label: 'BG Base',          property: '--color-bg-base' },
    { label: 'BG Surface',       property: '--color-bg-surface' },
    { label: 'BG Elevated',      property: '--color-bg-elevated' },
    { label: 'Accent Primary',   property: '--color-accent-primary' },
    { label: 'Accent Secondary', property: '--color-accent-secondary' },
    { label: 'Text Primary',     property: '--color-text-primary' },
    { label: 'Text Secondary',   property: '--color-text-secondary' },
    { label: 'Border',           property: '--color-border' },
  ];

  getColor(property: string): string {
    const stored = this.panel.colorState()[property];
    if (stored) return stored;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    return raw || '#000000';
  }

  onColorChange(property: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.panel.updateColor(property, value);
  }
}
