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
  opened: Passion | null = null;
  hovered: Passion | null = null;
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getPassions().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.sports = [];
      this.others = [];
      this.opened = null;
      this.hovered = null;
      data.forEach((p: Passion) => {
        if (p.type === 'sport') this.sports.push(p);
        else this.others.push(p);
      });
    });
  }

  inspect(event: PointerEvent, passion: Passion): void {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    this.hovered = passion;
    const card = event.currentTarget as HTMLElement;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
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

  toggle(passion: Passion): void {
    this.opened = this.opened === passion ? null : passion;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
