import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { SpotifyWidgetComponent } from '../shared/spotify-widget/spotify-widget.component';
import { Subject, takeUntil } from 'rxjs';
import { Passion } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';

@Component({
  selector: 'app-passions',
  templateUrl: './passions.component.html',
  styleUrl: './passions.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, TranslatePipe, ScrollRevealDirective, SpotifyWidgetComponent],
})
export class PassionsComponent implements OnInit, OnDestroy {
  sports: Passion[] = [];
  others: Passion[] = [];
  opened: string | null = null;
  hovered: string | null = null;
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getPassions().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.sports = [];
      this.others = [];
      data.forEach((p: Passion) => {
        if (p.type === 'sport') this.sports.push(p);
        else this.others.push(p);
      });
    });
  }

  inspect(event: PointerEvent, passion: Passion): void {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    this.hovered = passion.id;
    const card = event.currentTarget as HTMLElement;
    const { centerX, centerY, width } = this.positionInspection(card);
    const x = Math.max(0, Math.min(1, 0.5 + (event.clientX - centerX) / width));
    const y = Math.max(0, Math.min(1, 0.5 + (event.clientY - (centerY - 12)) / 300));
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`);
  }

  leave(event: PointerEvent): void {
    this.hovered = null;
    if (event.pointerType === 'mouse') this.opened = null;
    const card = event.currentTarget as HTMLElement;
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  }

  toggle(passion: Passion, event: MouseEvent): void {
    this.positionInspection((event.currentTarget as HTMLElement).parentElement!);
    this.opened = this.opened === passion.id ? null : passion.id;
  }

  private positionInspection(slot: HTMLElement): { centerX: number; centerY: number; width: number } {
    const bounds = slot.getBoundingClientRect();
    const width = Math.max(bounds.width, Math.min(300, window.innerWidth - 48));
    slot.style.setProperty('--inspect-width', `${width}px`);
    slot.style.setProperty('--title-width', `${bounds.width}px`);
    const center = bounds.left + bounds.width / 2;
    // Leave room for the tilt and shadow, including on narrow touch screens.
    const clamped = Math.max(width / 2 + 24, Math.min(window.innerWidth - width / 2 - 24, center));
    slot.style.setProperty('--inspect-shift', `${clamped - center}px`);
    return { centerX: clamped, centerY: bounds.top + bounds.height / 2, width };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
