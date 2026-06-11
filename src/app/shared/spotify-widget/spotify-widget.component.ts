import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  imports: [CommonModule],
  template: '',
})
export class SpotifyWidgetComponent implements OnInit {
  readonly ranges: { label: string; value: TimeRange }[] = [
    { label: '4 semaines', value: 'short_term' },
    { label: '6 mois', value: 'medium_term' },
    { label: 'Tout le temps', value: 'long_term' },
  ];

  selectedRange = signal<TimeRange>('short_term');
  status = signal<'loading' | 'loaded' | 'error'>('loading');
  track = signal<SpotifyTrack | null>(null);
  embedUrl = signal<SafeResourceUrl | null>(null);

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.fetchTopTrack(this.selectedRange());
  }

  selectRange(range: TimeRange): void {
    this.selectedRange.set(range);
    this.fetchTopTrack(range);
  }

  private fetchTopTrack(range: TimeRange): void {
    this.status.set('loading');
    this.http
      .get<SpotifyTrack>(`/.netlify/functions/spotify-top-track?time_range=${range}`)
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
}
