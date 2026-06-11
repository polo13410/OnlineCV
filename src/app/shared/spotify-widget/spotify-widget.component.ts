import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
}

@Component({
  selector: 'app-spotify-widget',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './spotify-widget.component.html',
  styleUrl: './spotify-widget.component.scss',
})
export class SpotifyWidgetComponent implements OnInit {
  readonly ranges: { labelKey: string; value: TimeRange }[] = [
    { labelKey: 'PASSIONS.SPOTIFY_WEEK', value: 'short_term' },
    { labelKey: 'PASSIONS.SPOTIFY_MONTH', value: 'medium_term' },
    { labelKey: 'PASSIONS.SPOTIFY_ALL', value: 'long_term' },
  ];

  selectedRange = signal<TimeRange>('short_term');
  status = signal<'loading' | 'loaded' | 'error'>('loading');
  track = signal<SpotifyTrack | null>(null);
  embedUrl = signal<SafeResourceUrl | null>(null);

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly rangeChange$ = new Subject<TimeRange>();

  constructor() {
    this.rangeChange$
      .pipe(
        switchMap((range) => {
          this.status.set('loading');
          return this.http.get<SpotifyTrack>(
            `/.netlify/functions/spotify-top-track?time_range=${range}`
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (data) => {
          this.track.set(data);
          this.embedUrl.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://open.spotify.com/embed/track/${data.id}?utm_source=generator`
            )
          );
          this.status.set('loaded');
        },
        error: () => {
          this.track.set(null);
          this.embedUrl.set(null);
          this.status.set('error');
        },
      });
  }

  ngOnInit(): void {
    this.rangeChange$.next('short_term');
  }

  selectRange(range: TimeRange): void {
    this.selectedRange.set(range);
    this.rangeChange$.next(range);
  }
}
