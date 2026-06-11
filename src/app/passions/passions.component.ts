import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [CommonModule, TranslateModule, ScrollRevealDirective, SpotifyWidgetComponent],
})
export class PassionsComponent implements OnInit, OnDestroy {
  sports: string[] = [];
  others: string[] = [];
  private readonly json = inject(GetJsonService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.json.getPassions().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.sports = [];
      this.others = [];
      data.forEach((p: Passion) => {
        if (p.type === 'sport') this.sports.push(p.name);
        else this.others.push(p.name);
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
