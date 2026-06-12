import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  SpotifyEmbedService,
  SpotifyEmbedController,
} from './spotify-embed.service';

export type TrackSelection = 'short_term' | 'medium_term' | 'long_term' | 'liked';

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
  animations: [
    // Sequenced crossfade between tiles (skeleton / card / player / error):
    // the leaving tile fades out in place (absolute, so it doesn't stack
    // under the next one), the entering tile waits for it before fading in.
    trigger('tileFade', [
      transition(':leave', [
        style({ position: 'absolute', top: 0, left: 0, width: '100%' }),
        animate('150ms ease', style({ opacity: 0 })),
      ]),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms 150ms ease', style({ opacity: 1 })),
      ]),
      // selectedRange change on a reused card element (cache hit)
      transition('* => *', [
        style({ opacity: 0 }),
        animate('250ms ease', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SpotifyWidgetComponent implements OnInit, OnDestroy {
  readonly ranges: { labelKey: string; value: TrackSelection }[] = [
    { labelKey: 'PASSIONS.SPOTIFY_WEEK', value: 'short_term' },
    { labelKey: 'PASSIONS.SPOTIFY_MONTH', value: 'medium_term' },
    { labelKey: 'PASSIONS.SPOTIFY_ALL', value: 'long_term' },
    { labelKey: 'PASSIONS.SPOTIFY_LIKED', value: 'liked' },
  ];

  selectedRange = signal<TrackSelection>('short_term');
  status = signal<'loading' | 'loaded' | 'error'>('loading');
  track = signal<SpotifyTrack | null>(null);
  view = signal<'card' | 'player'>('card');

  currentLabelKey = computed(
    () => this.ranges.find((r) => r.value === this.selectedRange())!.labelKey
  );
  spotifyUrl = computed(() => {
    const t = this.track();
    return t ? `https://open.spotify.com/track/${t.id}` : '';
  });

  private readonly http = inject(HttpClient);
  private readonly embed = inject(SpotifyEmbedService);
  private readonly rangeChange$ = new Subject<TrackSelection>();
  private readonly trackCache = new Map<TrackSelection, SpotifyTrack>();
  private controller: SpotifyEmbedController | null = null;

  @ViewChild('embedHost')
  set embedHost(ref: ElementRef<HTMLElement> | undefined) {
    const track = this.track();
    if (ref && track) {
      this.embed
        .createController(ref.nativeElement, track.id)
        .then((controller) => (this.controller = controller));
    }
  }

  constructor() {
    this.rangeChange$
      .pipe(
        switchMap((range) => {
          const cached = this.trackCache.get(range);
          if (cached) {
            return of(cached);
          }
          this.status.set('loading');
          return this.http
            .get<SpotifyTrack>(
              `/.netlify/functions/spotify-top-track?time_range=${range}`
            )
            .pipe(
              // Catch inside switchMap so one failed request
              // doesn't terminate the whole range stream
              catchError(() => {
                this.track.set(null);
                this.status.set('error');
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe((data) => {
        this.trackCache.set(this.selectedRange(), data);
        this.track.set(data);
        this.status.set('loaded');
      });
  }

  ngOnInit(): void {
    this.rangeChange$.next('short_term');
  }

  ngOnDestroy(): void {
    this.destroyController();
  }

  selectRange(range: TrackSelection): void {
    this.destroyController();
    this.view.set('card');
    this.selectedRange.set(range);
    this.rangeChange$.next(range);
  }

  startPlayback(): void {
    this.view.set('player');
  }

  closePlayer(): void {
    this.destroyController();
    this.view.set('card');
  }

  private destroyController(): void {
    this.controller?.destroy();
    this.controller = null;
  }
}
