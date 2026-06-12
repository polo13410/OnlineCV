import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { SpotifyWidgetComponent } from '../shared/spotify-widget/spotify-widget.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Passion } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { ConstellationComponent } from '../shared/constellation/constellation.component';
import { ConstellationCardDirective } from '../shared/constellation/constellation-card.directive';
import { ConstellationCategory } from '../shared/constellation/constellation.types';
import { slugify } from '../shared/constellation/constellation-layout.service';

const LABEL_KEYS = [
  'PASSIONS.SPORTS',
  'PASSIONS.OTHERS',
  'PASSIONS.SPOTIFY_OVERLINE',
  'PASSIONS.SPOTIFY_TITLE',
] as const;

@Component({
  selector: 'app-passions',
  templateUrl: './passions.component.html',
  styleUrl: './passions.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ScrollRevealDirective,
    SpotifyWidgetComponent,
    ConstellationComponent,
    ConstellationCardDirective,
  ],
})
export class PassionsComponent implements OnInit, OnDestroy {
  categories: ConstellationCategory[] = [];
  private readonly json = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getPassions(),
      this.translate.stream([...LABEL_KEYS]),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([passions, labels]) => {
        this.categories = this.toCategories(passions, labels);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toCategories(
    passions: Passion[],
    labels: Record<string, string>
  ): ConstellationCategory[] {
    const sports = passions.filter((p) => p.type === 'sport');
    const others = passions.filter((p) => p.type !== 'sport');
    return [
      {
        id: 'sports',
        label: labels['PASSIONS.SPORTS'],
        cards: sports.map((p) => ({ id: slugify(p.name), title: p.name })),
      },
      {
        id: 'autres',
        label: labels['PASSIONS.OTHERS'],
        cards: others.map((p) => ({ id: slugify(p.name), title: p.name })),
      },
      {
        id: 'musique',
        label: labels['PASSIONS.SPOTIFY_OVERLINE'],
        cards: [
          {
            id: 'spotify',
            title: labels['PASSIONS.SPOTIFY_TITLE'],
            templateId: 'spotify',
          },
        ],
      },
    ];
  }
}
