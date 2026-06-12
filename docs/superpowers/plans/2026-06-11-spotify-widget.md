# Spotify Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un widget sur la page Passions affichant le top track Spotify de Paul, avec sélecteur de période (4 semaines / 6 mois / tout le temps), via un embed Spotify officiel alimenté par une Netlify Function.

**Architecture:** L'Angular app appelle `/.netlify/functions/spotify-top-track?time_range=...`. La Netlify Function lit les secrets d'env (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN), rafraîchit l'access token, fetch `/me/top/tracks`, renvoie `{ id, name, artist, albumCover }`. Le composant Angular affiche l'iframe Spotify embed avec l'ID retourné.

**Tech Stack:** Angular 21 standalone + signals, HttpClient, DomSanitizer, Netlify Functions (Node 18, fetch natif), Karma/Jasmine

---

## File Structure

| Action | Fichier | Responsabilité |
|--------|---------|---------------|
| Create | `netlify/functions/spotify-top-track.js` | Proxy serverless : refresh token + fetch Spotify API |
| Create | `netlify.toml` | Config Netlify : build command, publish dir, functions dir |
| Create | `src/app/shared/spotify-widget/spotify-widget.component.ts` | Logique : signals, HTTP call, state |
| Create | `src/app/shared/spotify-widget/spotify-widget.component.html` | Template : range selector + iframe/skeleton/error |
| Create | `src/app/shared/spotify-widget/spotify-widget.component.scss` | Styles suivant les design tokens existants |
| Create | `src/app/shared/spotify-widget/spotify-widget.component.spec.ts` | Tests Karma/Jasmine avec HttpTestingController |
| Modify | `src/app/passions/passions.component.html` | Ajouter section header + `<app-spotify-widget>` |
| Modify | `src/app/passions/passions.component.ts` | Importer SpotifyWidgetComponent |

---

## Task 0 : Prérequis — Obtenir le Refresh Token Spotify

> Étape manuelle one-shot. À faire avant d'écrire du code.

- [ ] **Step 1 : Créer une app Spotify Developer**

  Aller sur https://developer.spotify.com/dashboard → "Create App".
  - App name : `OnlineCV`
  - Redirect URI : `http://localhost:3000/callback`
  - Cocher "Web API"
  
  Copier le **Client ID** et **Client Secret**.

- [ ] **Step 2 : Générer le code d'autorisation**

  Ouvrir dans le navigateur (remplacer `{CLIENT_ID}`) :
  ```
  https://accounts.spotify.com/authorize?client_id={CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-top-read
  ```

  Spotify redirige vers `http://localhost:3000/callback?code=XXXXXX`.
  Copier la valeur du paramètre `code`.

- [ ] **Step 3 : Échanger le code contre un refresh token**

  Dans le terminal (remplacer les 3 valeurs) :
  ```bash
  curl -X POST https://accounts.spotify.com/api/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Authorization: Basic $(echo -n '{CLIENT_ID}:{CLIENT_SECRET}' | base64)" \
    -d "grant_type=authorization_code&code={CODE}&redirect_uri=http://localhost:3000/callback"
  ```

  La réponse JSON contient `"refresh_token": "AAAA..."`. **Conserver cette valeur.**

- [ ] **Step 4 : Configurer les env vars dans Netlify Dashboard**

  Site Settings → Environment Variables → Add :
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `SPOTIFY_REFRESH_TOKEN`

---

## Task 1 : Netlify Function

**Files:**
- Create: `netlify.toml`
- Create: `netlify/functions/spotify-top-track.js`

- [ ] **Step 1 : Créer `netlify.toml`**

  ```toml
  [build]
    command = "ng build"
    publish = "dist/online-cv/browser"

  [functions]
    directory = "netlify/functions"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

- [ ] **Step 2 : Créer la Netlify Function**

  Créer `netlify/functions/spotify-top-track.js` :

  ```js
  exports.handler = async (event) => {
    const CORS_HEADERS = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    const validRanges = ['short_term', 'medium_term', 'long_term'];
    const timeRange = event.queryStringParameters?.time_range ?? 'short_term';

    if (!validRanges.includes(timeRange)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid time_range' }),
      };
    }

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    });

    if (!tokenRes.ok) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Token refresh failed' }),
      };
    }

    const { access_token } = await tokenRes.json();

    const tracksRes = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=1`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!tracksRes.ok) {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Spotify API error' }),
      };
    }

    const data = await tracksRes.json();

    if (!data.items?.length) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No tracks found' }),
      };
    }

    const item = data.items[0];
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        id: item.id,
        name: item.name,
        artist: item.artists[0].name,
        albumCover: item.album.images[0]?.url ?? '',
      }),
    };
  };
  ```

- [ ] **Step 3 : Vérifier que `.env` est dans `.gitignore`**

  Ouvrir `.gitignore` à la racine. Si la ligne `.env` n'y est pas, l'ajouter :
  ```
  .env
  ```

- [ ] **Step 4 : Installer netlify-cli et tester la function**

  ```bash
  npm install -g netlify-cli
  ```

  Créer un fichier `.env` à la racine (ne pas committer) :
  ```
  SPOTIFY_CLIENT_ID=your_client_id
  SPOTIFY_CLIENT_SECRET=your_client_secret
  SPOTIFY_REFRESH_TOKEN=your_refresh_token
  ```

  Lancer les fonctions en local :
  ```bash
  netlify functions:serve --port 9999
  ```

  Tester dans le navigateur :
  ```
  http://localhost:9999/.netlify/functions/spotify-top-track?time_range=short_term
  ```

  Résultat attendu :
  ```json
  { "id": "...", "name": "...", "artist": "...", "albumCover": "..." }
  ```

- [ ] **Step 5 : Commit**

  ```bash
  git add netlify.toml netlify/functions/spotify-top-track.js .gitignore
  git commit -m "feat(spotify): add netlify function proxy for spotify top track"
  ```

---

## Task 2 : Proxy de développement Angular

**Files:**
- Create: `proxy.conf.json`
- Modify: `angular.json` (section `serve > options`)

- [ ] **Step 1 : Créer `proxy.conf.json`**

  À la racine du projet :
  ```json
  {
    "/.netlify/functions": {
      "target": "http://localhost:9999",
      "secure": false,
      "changeOrigin": true
    }
  }
  ```

- [ ] **Step 2 : Référencer le proxy dans `angular.json`**

  Dans `angular.json`, trouver `projects > online-cv > architect > serve`. Ajouter `proxyConfig` dans `options` :

  ```json
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "proxy.conf.json"
    },
    "configurations": {
      ...
    }
  }
  ```

- [ ] **Step 3 : Vérifier que le proxy fonctionne**

  Dans un terminal :
  ```bash
  netlify functions:serve --port 9999
  ```

  Dans un autre terminal :
  ```bash
  ng serve
  ```

  Ouvrir `http://localhost:4200/.netlify/functions/spotify-top-track?time_range=short_term`.
  Résultat attendu : même JSON qu'en Task 1 Step 3.

- [ ] **Step 4 : Commit**

  ```bash
  git add proxy.conf.json angular.json
  git commit -m "feat(spotify): configure angular dev proxy for netlify functions"
  ```

---

## Task 3 : SpotifyWidgetComponent — Tests

**Files:**
- Create: `src/app/shared/spotify-widget/spotify-widget.component.ts` (squelette)
- Create: `src/app/shared/spotify-widget/spotify-widget.component.spec.ts`

- [ ] **Step 1 : Créer le squelette minimal du composant**

  `src/app/shared/spotify-widget/spotify-widget.component.ts` :
  ```typescript
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
  ```

- [ ] **Step 2 : Écrire les tests**

  `src/app/shared/spotify-widget/spotify-widget.component.spec.ts` :
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { provideHttpClient } from '@angular/common/http';
  import { provideHttpClientTesting } from '@angular/common/http/testing';
  import { HttpTestingController } from '@angular/common/http/testing';
  import { SpotifyWidgetComponent } from './spotify-widget.component';

  describe('SpotifyWidgetComponent', () => {
    let component: SpotifyWidgetComponent;
    let fixture: ComponentFixture<SpotifyWidgetComponent>;
    let httpMock: HttpTestingController;

    const mockTrack = {
      id: 'track123',
      name: 'Mr. Brightside',
      artist: 'The Killers',
      albumCover: 'https://example.com/cover.jpg',
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SpotifyWidgetComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      }).compileComponents();

      fixture = TestBed.createComponent(SpotifyWidgetComponent);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('should create', () => {
      httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
      expect(component).toBeTruthy();
    });

    it('should be in loading state on init before response', () => {
      expect(component.status()).toBe('loading');
      httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
    });

    it('should set status loaded and track on success', () => {
      httpMock
        .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
        .flush(mockTrack);
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

    it('should fetch with correct time_range when selectRange called', () => {
      httpMock
        .expectOne('/.netlify/functions/spotify-top-track?time_range=short_term')
        .flush(mockTrack);

      component.selectRange('medium_term');
      fixture.detectChanges();

      expect(component.selectedRange()).toBe('medium_term');
      expect(component.status()).toBe('loading');
      httpMock
        .expectOne('/.netlify/functions/spotify-top-track?time_range=medium_term')
        .flush(mockTrack);
      expect(component.status()).toBe('loaded');
    });

    it('should have 3 range options', () => {
      expect(component.ranges.length).toBe(3);
      expect(component.ranges.map(r => r.value)).toEqual([
        'short_term',
        'medium_term',
        'long_term',
      ]);
      httpMock.expectOne(r => r.url.includes('spotify-top-track')).flush(mockTrack);
    });
  });
  ```

- [ ] **Step 3 : Lancer les tests et vérifier qu'ils échouent**

  ```bash
  ng test --include="**/spotify-widget.component.spec.ts" --watch=false
  ```

  Résultat attendu : erreurs de compilation (le template est vide, les méthodes ne sont pas encore testées à fond). Les tests de logique doivent passer car la logique est déjà dans le squelette.

  > Si tous les tests passent déjà — c'est normal, la logique est dans le squelette. Continuer.

---

## Task 4 : SpotifyWidgetComponent — Template et Styles

**Files:**
- Modify: `src/app/shared/spotify-widget/spotify-widget.component.ts` (ajouter templateUrl/styleUrl)
- Create: `src/app/shared/spotify-widget/spotify-widget.component.html`
- Create: `src/app/shared/spotify-widget/spotify-widget.component.scss`

- [ ] **Step 1 : Créer le template HTML**

  `src/app/shared/spotify-widget/spotify-widget.component.html` :
  ```html
  <div class="range-selector">
    @for (range of ranges; track range.value) {
      <button
        class="range-btn"
        [class.range-btn--active]="selectedRange() === range.value"
        (click)="selectRange(range.value)"
      >
        {{ range.label }}
      </button>
    }
  </div>

  @if (status() === 'loading') {
    <div class="spotify-skeleton"></div>
  }

  @if (status() === 'loaded' && embedUrl()) {
    <iframe
      [src]="embedUrl()"
      width="100%"
      height="152"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      class="spotify-embed"
    ></iframe>
  }

  @if (status() === 'error') {
    <div class="spotify-error">Spotify indisponible</div>
  }
  ```

- [ ] **Step 2 : Créer les styles SCSS**

  `src/app/shared/spotify-widget/spotify-widget.component.scss` :
  ```scss
  @use '../../../styles/mixins' as m;

  .range-selector {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .range-btn {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-family: var(--font-main);
    cursor: pointer;
    transition: border-color var(--transition-base), color var(--transition-base);

    &--active {
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
    }

    &:hover:not(.range-btn--active) {
      border-color: var(--color-text-muted);
      color: var(--color-text-primary);
    }
  }

  .spotify-skeleton {
    width: 100%;
    height: 152px;
    border-radius: var(--border-radius-md);
    background: linear-gradient(
      90deg,
      var(--color-bg-surface) 25%,
      var(--color-bg-elevated) 50%,
      var(--color-bg-surface) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border: 1px solid var(--color-border);
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .spotify-embed {
    display: block;
    width: 100%;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border);
  }

  .spotify-error {
    height: 152px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
  ```

- [ ] **Step 3 : Mettre à jour le composant pour utiliser templateUrl/styleUrl**

  Dans `src/app/shared/spotify-widget/spotify-widget.component.ts`, remplacer `template: '',` par :
  ```typescript
  templateUrl: './spotify-widget.component.html',
  styleUrl: './spotify-widget.component.scss',
  ```

- [ ] **Step 4 : Lancer les tests et vérifier qu'ils passent**

  ```bash
  ng test --include="**/spotify-widget.component.spec.ts" --watch=false
  ```

  Résultat attendu : 6 tests PASSED, 0 FAILED.

- [ ] **Step 5 : Commit**

  ```bash
  git add src/app/shared/spotify-widget/
  git commit -m "feat(spotify): add SpotifyWidgetComponent with tests"
  ```

---

## Task 5 : Intégration dans PassionsComponent

**Files:**
- Modify: `src/app/passions/passions.component.ts`
- Modify: `src/app/passions/passions.component.html`

- [ ] **Step 1 : Importer SpotifyWidgetComponent**

  Dans `src/app/passions/passions.component.ts`, ajouter l'import :
  ```typescript
  import { SpotifyWidgetComponent } from '../shared/spotify-widget/spotify-widget.component';
  ```

  Et dans le décorateur `@Component`, ajouter `SpotifyWidgetComponent` dans `imports` :
  ```typescript
  imports: [CommonModule, TranslateModule, ScrollRevealDirective, SpotifyWidgetComponent],
  ```

- [ ] **Step 2 : Ajouter la section Spotify dans le template**

  Dans `src/app/passions/passions.component.html`, ajouter à la fin (après la dernière `</div>` de `.passion-grid`) :
  ```html
  <div class="section-header section-header--other" appScrollReveal="reveal">
    <p class="section-overline">MUSIQUE</p>
    <h2>Ma musique du moment</h2>
  </div>
  <app-spotify-widget></app-spotify-widget>
  ```

- [ ] **Step 3 : Lancer les tests de PassionsComponent**

  ```bash
  ng test --include="**/passions.component.spec.ts" --watch=false
  ```

  > Note : le spec existant utilise `declarations` (ancienne API). S'il échoue à cause de ça, remplacer `declarations: [PassionsComponent]` par `imports: [PassionsComponent]` dans le `TestBed.configureTestingModule`.

  Résultat attendu : 1 test PASSED.

- [ ] **Step 4 : Vérifier visuellement**

  Avec `netlify functions:serve --port 9999` en cours dans un terminal et `ng serve` dans un autre :
  - Naviguer vers la page Passions
  - Vérifier que la section "Ma musique du moment" apparaît
  - Vérifier que l'iframe Spotify se charge avec le bon track
  - Cliquer sur "6 mois" → l'iframe doit se recharger avec un nouveau track
  - Couper le réseau / les fonctions → vérifier que "Spotify indisponible" s'affiche

- [ ] **Step 5 : Commit final**

  ```bash
  git add src/app/passions/passions.component.ts src/app/passions/passions.component.html
  git commit -m "feat(spotify): integrate SpotifyWidget into PassionsComponent"
  ```

---

## Checklist de validation finale

- [ ] `ng test --watch=false` : tous les tests passent
- [ ] `ng build` : build sans erreurs
- [ ] Widget visible sur la page Passions
- [ ] Les 3 boutons de période fonctionnent
- [ ] L'iframe Spotify se charge et est jouable
- [ ] L'état d'erreur s'affiche si la function est indisponible
- [ ] Les env vars sont configurées dans Netlify Dashboard
- [ ] `.env` est dans `.gitignore`
