# Spotify Widget Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the always-visible Spotify iframe with a fully native track card (site design tokens) that swaps in-place to the Spotify embed player on click, plus a 4th "♥ Dernier like" pill.

**Architecture:** The existing Netlify function gains a `liked` mode (`/me/tracks?limit=1`). The Angular `SpotifyWidgetComponent` keeps its Subject+switchMap HTTP flow but renders a native card from the JSON (`name`, `artist`, `albumCover`, `id`); a new `SpotifyEmbedService` lazy-loads Spotify's iFrame Embed API script on first play and creates/destroys embed controllers (auto-`play()` on `ready` event).

**Tech Stack:** Angular 21 (standalone, signals, `@if/@for`), Karma/Jasmine, ngx-translate, Netlify Functions (plain JS), Spotify iFrame Embed API (`https://open.spotify.com/embed/iframe-api/v1`).

**Spec:** `docs/superpowers/specs/2026-06-12-spotify-widget-rework-design.md`

**Verified Embed API facts** (developer.spotify.com/documentation/embeds):
- Script: `<script src="https://open.spotify.com/embed/iframe-api/v1" async>` → calls `window.onSpotifyIframeApiReady(IFrameAPI)`.
- `IFrameAPI.createController(element, { uri, width, height }, callback)` — replaces `element` with the iframe, callback receives `EmbedController`.
- `EmbedController`: `play()`, `destroy()`, `addListener('ready', cb)` (fires when ready to stream).

**Test command:** `npm test -- --watch=false --browsers=ChromeHeadless`

---

### Task 1: Netlify function — `liked` mode

**Files:**
- Modify: `netlify/functions/spotify-top-track.js`

No test harness exists for functions; this is a small mapping change, verified manually in Task 6.

- [ ] **Step 1: Accept `liked` and branch the Spotify endpoint**

In `netlify/functions/spotify-top-track.js`, change line 15:

```js
const validRanges = ['short_term', 'medium_term', 'long_term', 'liked'];
```

Replace the `tracksRes` fetch (lines 59-62) with:

```js
    const apiUrl =
      timeRange === 'liked'
        ? 'https://api.spotify.com/v1/me/tracks?limit=1'
        : `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=1`;

    const tracksRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
```

Replace `const item = data.items[0];` (line 82) with (saved-tracks items wrap the track in a `track` property):

```js
    const item = timeRange === 'liked' ? data.items[0].track : data.items[0];
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/spotify-top-track.js
git commit -m "feat(spotify): support liked mode in top-track function"
```

---

### Task 2: i18n keys

**Files:**
- Modify: `src/assets/i18n/fr.json` (PASSIONS block, after `SPOTIFY_ALL`)
- Modify: `src/assets/i18n/en.json` (same place)

- [ ] **Step 1: Add the new keys**

`fr.json` — extend the `PASSIONS` object:

```json
    "SPOTIFY_ALL": "Depuis toujours",
    "SPOTIFY_LIKED": "♥ Dernier like",
    "SPOTIFY_ERROR": "Spotify indisponible",
    "SPOTIFY_PLAY": "Écouter",
    "SPOTIFY_CLOSE": "Fermer le lecteur"
```

`en.json`:

```json
    "SPOTIFY_ALL": "All time",
    "SPOTIFY_LIKED": "♥ Latest like",
    "SPOTIFY_ERROR": "Spotify unavailable",
    "SPOTIFY_PLAY": "Play",
    "SPOTIFY_CLOSE": "Close player"
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/i18n/fr.json src/assets/i18n/en.json
git commit -m "feat(spotify): add i18n keys for liked pill, play/close and error"
```

---

### Task 3: `SpotifyEmbedService`

**Files:**
- Create: `src/app/shared/spotify-widget/spotify-embed.service.ts`
- Test: `src/app/shared/spotify-widget/spotify-embed.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

`spotify-embed.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { SpotifyEmbedService, SpotifyEmbedController } from './spotify-embed.service';

interface FakeApi {
  createController: jasmine.Spy;
}

describe('SpotifyEmbedService', () => {
  let service: SpotifyEmbedService;
  let appendSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyEmbedService);
    // Prevent the real Spotify script from loading in Karma
    appendSpy = spyOn(document.body, 'appendChild').and.callFake(
      ((node: Node) => node) as never
    );
    delete (window as { onSpotifyIframeApiReady?: unknown }).onSpotifyIframeApiReady;
  });

  function makeController(): jasmine.SpyObj<SpotifyEmbedController> {
    return jasmine.createSpyObj<SpotifyEmbedController>('controller', [
      'play',
      'destroy',
      'addListener',
    ]);
  }

  function resolveApi(controller: SpotifyEmbedController): FakeApi {
    const api: FakeApi = { createController: jasmine.createSpy('createController') };
    api.createController.and.callFake(
      (_el: HTMLElement, _opts: unknown, cb: (c: SpotifyEmbedController) => void) =>
        cb(controller)
    );
    (window as unknown as { onSpotifyIframeApiReady: (a: FakeApi) => void })
      .onSpotifyIframeApiReady(api);
    return api;
  }

  it('injects the embed script only once across calls', async () => {
    const controller = makeController();
    const p1 = service.createController(document.createElement('div'), 'aaa');
    const p2 = service.createController(document.createElement('div'), 'bbb');
    expect(appendSpy).toHaveBeenCalledTimes(1);
    resolveApi(controller);
    await Promise.all([p1, p2]);
  });

  it('creates a controller with the track uri and autoplays on ready', async () => {
    const controller = makeController();
    const host = document.createElement('div');
    const promise = service.createController(host, 'track123');
    const api = resolveApi(controller);

    const result = await promise;

    expect(api.createController).toHaveBeenCalledWith(
      host,
      jasmine.objectContaining({ uri: 'spotify:track:track123' }),
      jasmine.any(Function)
    );
    expect(result).toBe(controller);

    expect(controller.addListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
    const readyCb = controller.addListener.calls.mostRecent().args[1] as () => void;
    readyCb();
    expect(controller.play).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — cannot resolve `./spotify-embed.service`.

- [ ] **Step 3: Implement the service**

`spotify-embed.service.ts`:

```ts
import { Injectable } from '@angular/core';

export interface SpotifyEmbedController {
  play(): void;
  destroy(): void;
  addListener(event: string, callback: () => void): void;
}

interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ): void;
}

const EMBED_SCRIPT_URL = 'https://open.spotify.com/embed/iframe-api/v1';
const EMBED_HEIGHT = 100;

@Injectable({ providedIn: 'root' })
export class SpotifyEmbedService {
  private apiPromise: Promise<SpotifyIframeApi> | null = null;

  createController(
    element: HTMLElement,
    trackId: string
  ): Promise<SpotifyEmbedController> {
    return this.loadApi().then(
      (api) =>
        new Promise<SpotifyEmbedController>((resolve) => {
          api.createController(
            element,
            { uri: `spotify:track:${trackId}`, width: '100%', height: EMBED_HEIGHT },
            (controller) => {
              controller.addListener('ready', () => controller.play());
              resolve(controller);
            }
          );
        })
    );
  }

  private loadApi(): Promise<SpotifyIframeApi> {
    if (!this.apiPromise) {
      this.apiPromise = new Promise((resolve) => {
        (
          window as unknown as {
            onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
          }
        ).onSpotifyIframeApiReady = (api) => resolve(api);
        const script = document.createElement('script');
        script.src = EMBED_SCRIPT_URL;
        script.async = true;
        document.body.appendChild(script);
      });
    }
    return this.apiPromise;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (both new specs; existing suites untouched).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/spotify-widget/spotify-embed.service.ts src/app/shared/spotify-widget/spotify-embed.service.spec.ts
git commit -m "feat(spotify): add embed service lazy-loading the iFrame API"
```

---

### Task 4: Component rework — selection model, view swap, embed integration

**Files:**
- Modify: `src/app/shared/spotify-widget/spotify-widget.component.ts` (full rewrite below)
- Modify: `src/app/shared/spotify-widget/spotify-widget.component.spec.ts` (full rewrite below)

- [ ] **Step 1: Rewrite the spec**

`spotify-widget.component.spec.ts` (replaces the file — old `embedUrl` test dropped, new view-swap tests added):

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SpotifyWidgetComponent } from './spotify-widget.component';
import {
  SpotifyEmbedService,
  SpotifyEmbedController,
} from './spotify-embed.service';

describe('SpotifyWidgetComponent', () => {
  let component: SpotifyWidgetComponent;
  let fixture: ComponentFixture<SpotifyWidgetComponent>;
  let httpMock: HttpTestingController;
  let embedService: jasmine.SpyObj<SpotifyEmbedService>;
  let controller: jasmine.SpyObj<SpotifyEmbedController>;

  const mockTrack = {
    id: 'track123',
    name: 'Mr. Brightside',
    artist: 'The Killers',
    albumCover: 'https://example.com/cover.jpg',
  };

  beforeEach(async () => {
    controller = jasmine.createSpyObj<SpotifyEmbedController>('controller', [
      'play',
      'destroy',
      'addListener',
    ]);
    embedService = jasmine.createSpyObj<SpotifyEmbedService>('SpotifyEmbedService', [
      'createController',
    ]);
    embedService.createController.and.resolveTo(controller);

    await TestBed.configureTestingModule({
      imports: [SpotifyWidgetComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SpotifyEmbedService, useValue: embedService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyWidgetComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushInitialRequest() {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .flush(mockTrack);
    fixture.detectChanges();
  }

  it('should create', () => {
    flushInitialRequest();
    expect(component).toBeTruthy();
  });

  it('should be in loading state on init before response', () => {
    expect(component.status()).toBe('loading');
    flushInitialRequest();
  });

  it('should set status loaded and track on success', () => {
    flushInitialRequest();
    expect(component.status()).toBe('loaded');
    expect(component.track()).toEqual(mockTrack);
  });

  it('should set status error and null track on HTTP error', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .error(new ErrorEvent('Network error'));
    expect(component.status()).toBe('error');
    expect(component.track()).toBeNull();
  });

  it('should have 4 options including liked', () => {
    expect(component.ranges.map((r) => r.value)).toEqual([
      'short_term',
      'medium_term',
      'long_term',
      'liked',
    ]);
    flushInitialRequest();
  });

  it('should fetch with time_range=liked when liked pill selected', () => {
    flushInitialRequest();
    component.selectRange('liked');
    expect(component.status()).toBe('loading');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=liked')
      .flush(mockTrack);
    expect(component.status()).toBe('loaded');
  });

  it('should render the native card with track info', () => {
    flushInitialRequest();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.track-card__name')?.textContent).toContain(
      'Mr. Brightside'
    );
    expect(el.querySelector('.track-card__artist')?.textContent).toContain(
      'The Killers'
    );
    const cover = el.querySelector<HTMLImageElement>('.track-card__cover');
    expect(cover?.src).toBe(mockTrack.albumCover);
    const link = el.querySelector<HTMLAnchorElement>('.track-card__spotify-link');
    expect(link?.href).toContain('open.spotify.com/track/track123');
  });

  it('should swap to player view and create a controller on play', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.view()).toBe('player');
    expect(embedService.createController).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      'track123'
    );
    expect(fixture.nativeElement.querySelector('.player-shell')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.track-card')).toBeFalsy();
  });

  it('should destroy controller and return to card on close', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    component.closePlayer();
    fixture.detectChanges();

    expect(controller.destroy).toHaveBeenCalled();
    expect(component.view()).toBe('card');
    expect(fixture.nativeElement.querySelector('.track-card')).toBeTruthy();
  });

  it('should return to card view when range changes while playing', async () => {
    flushInitialRequest();
    component.startPlayback();
    fixture.detectChanges();
    await fixture.whenStable();

    component.selectRange('medium_term');
    fixture.detectChanges();

    expect(controller.destroy).toHaveBeenCalled();
    expect(component.view()).toBe('card');
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
      .flush(mockTrack);
  });

  it('should show translated error state', () => {
    httpMock
      .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
      .error(new ErrorEvent('Network error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spotify-error')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `liked` not assignable to `TimeRange`, no `view`/`startPlayback`/`closePlayer`, card DOM missing.

- [ ] **Step 3: Rewrite the component class**

`spotify-widget.component.ts` (full file):

```ts
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
import { HttpClient } from '@angular/common/http';
import { Subject, switchMap } from 'rxjs';
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
          this.status.set('loaded');
        },
        error: () => {
          this.track.set(null);
          this.status.set('error');
        },
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
```

Notes: `DomSanitizer`/`embedUrl` are gone (no static iframe anymore). The HTTP error path means a failed `liked` call (e.g. missing scope) shows the standard error state — no special casing per spec.

- [ ] **Step 4: Update the template (required for DOM specs to pass)**

`spotify-widget.component.html` (full file):

```html
<div class="range-selector">
  @for (range of ranges; track range.value) {
    <button
      class="range-btn"
      [class.range-btn--active]="selectedRange() === range.value"
      (click)="selectRange(range.value)"
    >
      {{ range.labelKey | translate }}
    </button>
  }
</div>

@if (status() === "loading") {
  <div class="spotify-skeleton"></div>
}

@if (status() === "loaded" && track(); as t) {
  @if (view() === "card") {
    <article class="track-card">
      <button
        class="track-card__play"
        (click)="startPlayback()"
        [attr.aria-label]="'PASSIONS.SPOTIFY_PLAY' | translate"
      >
        <img class="track-card__cover" [src]="t.albumCover" alt="" />
        <span class="track-card__play-icon" aria-hidden="true">▶</span>
      </button>
      <div class="track-card__info">
        <p class="track-card__overline">
          @if (selectedRange() !== "liked") {
            <span>#1 · </span>
          }
          {{ currentLabelKey() | translate }}
        </p>
        <p class="track-card__name">{{ t.name }}</p>
        <p class="track-card__artist">{{ t.artist }}</p>
      </div>
      <a
        class="track-card__spotify-link"
        [href]="spotifyUrl()"
        target="_blank"
        rel="noopener"
      >
        Spotify ↗
      </a>
    </article>
  } @else {
    <div class="player-shell">
      <div #embedHost></div>
      <button
        class="player-shell__close"
        (click)="closePlayer()"
        [attr.aria-label]="'PASSIONS.SPOTIFY_CLOSE' | translate"
      >
        ×
      </button>
    </div>
  }
}

@if (status() === "error") {
  <div class="spotify-error">{{ "PASSIONS.SPOTIFY_ERROR" | translate }}</div>
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS — all SpotifyWidgetComponent specs (styles come in Task 5; tests don't assert styles).

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/spotify-widget/
git commit -m "feat(spotify): hybrid native card with on-demand embed player and liked pill"
```

---

### Task 5: Card & player styles

**Files:**
- Modify: `src/app/shared/spotify-widget/spotify-widget.component.scss`

No new unit tests — visual task; verified in Task 6 in the browser.

- [ ] **Step 1: Replace the widget styles**

Keep `.range-selector`, `.range-btn`, `.spotify-skeleton`, `@keyframes shimmer`, `.spotify-error` as they are. Delete `.spotify-embed`. Append:

```scss
.track-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-sizing: border-box;
  min-height: 100px;
  padding: var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--glow-subtle);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);

  &:hover {
    border-color: var(--color-border-accent);
  }
}

.track-card__play {
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.track-card__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.track-card__play-icon {
  position: absolute;
  inset: 0;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-bg-base);
  opacity: 0.92;
  color: var(--color-accent-secondary);
  font-size: var(--font-size-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform var(--transition-fast);
}

.track-card__play:hover .track-card__play-icon {
  transform: scale(1.1);
}

.track-card__info {
  flex: 1;
  min-width: 0;
}

.track-card__overline {
  margin: 0 0 var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.track-card__name {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.track-card__artist {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.track-card__spotify-link {
  align-self: flex-end;
  white-space: nowrap;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-decoration: none;
  transition: color var(--transition-base);

  &:hover {
    color: var(--color-accent-primary);
  }
}

.player-shell {
  position: relative;

  // The Spotify script replaces the host div with an iframe outside
  // Angular's emulated encapsulation, hence ::ng-deep.
  ::ng-deep iframe {
    display: block;
    width: 100%;
    border: 0;
    border-radius: var(--border-radius-md);
  }
}

.player-shell__close {
  position: absolute;
  top: -9px;
  right: -9px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg-base);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--glow-subtle);
}
```

Also change `.spotify-skeleton`'s `height: 100px` → stays `100px` (matches card `min-height`), and confirm `.spotify-error` keeps `height: 100px`.

- [ ] **Step 2: Build to catch SCSS errors**

Run: `npm run build`
Expected: success (budget warnings acceptable if pre-existing).

- [ ] **Step 3: Commit**

```bash
git add src/app/shared/spotify-widget/spotify-widget.component.scss
git commit -m "style(spotify): native card and player shell styles"
```

---

### Task 6: Env docs + full verification

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Document the new scope requirement**

In `.env.example`, add/extend the comment above `SPOTIFY_REFRESH_TOKEN` (keep existing var lines):

```
# Refresh token must be generated with scopes: user-top-read user-library-read
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS — all suites (AppComponent, PassionsComponent, SpotifyWidgetComponent, SpotifyEmbedService).

- [ ] **Step 3: Manual verification (requires Netlify env vars locally)**

Run: `netlify dev` (or `npm start` with the existing `proxy.conf.json` against a running functions server), open the Passions page:
- Card renders with cover/title/artist in both themes; 4 pills work; "♥ Dernier like" returns a track only once the refresh token has the `user-library-read` scope (until then: error state — expected).
- Clicking ▶ swaps to the Spotify player and starts playback after load; × returns to the card; switching pill while playing returns to the card.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "docs(spotify): note required scopes for refresh token"
```

---

## Manual follow-up for Paul (outside the repo)

Regenerate the Spotify refresh token with **both** scopes `user-top-read user-library-read` (same one-shot OAuth Authorization Code flow used originally), then update `SPOTIFY_REFRESH_TOKEN` in the Netlify dashboard env vars and your local `.env`. Until then the "♥ Dernier like" pill returns the error state.
