# Spotify Widget — Design Spec

**Date:** 2026-06-11  
**Page cible:** Passions  
**Statut:** Approuvé

---

## Résumé

Ajouter un widget sur la page Passions qui affiche la track #1 la plus écoutée sur le compte Spotify de Paul, avec un sélecteur de période (4 semaines / 6 mois / tout le temps). Le widget intègre le lecteur embarqué officiel Spotify (iframe) pour permettre d'écouter directement.

---

## Architecture

```
PassionsComponent
  └── SpotifyWidgetComponent
        │  (signal: selectedRange)
        ▼
  /.netlify/functions/spotify-top-track?time_range=...
        │  (env vars serveur : CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
        ▼
  Spotify API /me/top/tracks?limit=1
        │
        ▼
  <iframe> open.spotify.com/embed/track/{id}
```

Le secret Spotify ne touche jamais le navigateur. L'Angular app appelle la Netlify Function, qui gère le token refresh et proxy la requête Spotify.

---

## Composant Angular — `SpotifyWidgetComponent`

**Fichier :** `src/app/shared/spotify-widget/spotify-widget.component.ts`

**Standalone**, importé directement dans `PassionsComponent`.

### Signals

| Signal | Type | Valeur par défaut |
|--------|------|-------------------|
| `selectedRange` | `'short_term' \| 'medium_term' \| 'long_term'` | `'short_term'` |
| `status` | `'loading' \| 'loaded' \| 'error'` | `'loading'` |
| `track` | `SpotifyTrack \| null` | `null` |

### Interface

```ts
interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
}
```

### Comportement

- Au `ngOnInit` et à chaque changement de `selectedRange` → appel HTTP `GET /.netlify/functions/spotify-top-track?time_range={selectedRange}`
- `status` passe à `'loading'` à chaque nouvel appel
- Succès → `track` mis à jour, `status = 'loaded'`
- Échec → `status = 'error'`, `track` reste `null`

### Mapping des périodes

| Label affiché | `time_range` Spotify | Description Spotify |
|---------------|---------------------|---------------------|
| 4 semaines | `short_term` | ~4 dernières semaines |
| 6 mois | `medium_term` | ~6 derniers mois |
| Tout le temps | `long_term` | Plusieurs années |

---

## Template

```
[ Section header "Ma musique du moment" ]

[ Sélecteur 3 boutons : 4 semaines | 6 mois | Tout le temps ]

[ État loading  ] → skeleton animé (même hauteur que l'iframe)
[ État loaded   ] → <iframe> embed Spotify (track ID dynamique)
[ État error    ] → message discret "Spotify indisponible"
```

L'iframe Spotify est affichée avec :
- `src="https://open.spotify.com/embed/track/{track.id}?utm_source=generator"`
- `allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"`
- `loading="lazy"`
- Hauteur : 152px (compact player Spotify)
- Largeur : 100%
- Borde arrondie avec `--border-radius-md`, `border: 1px solid var(--color-border)`

---

## Netlify Function — `spotify-top-track`

**Fichier :** `netlify/functions/spotify-top-track.ts`

### Flux

1. Lire `time_range` depuis les query params (valider : `short_term | medium_term | long_term`, défaut `short_term`)
2. POST `https://accounts.spotify.com/api/token` avec `grant_type=refresh_token` + `SPOTIFY_REFRESH_TOKEN` → obtenir `access_token`
3. GET `https://api.spotify.com/v1/me/top/tracks?time_range={time_range}&limit=1` avec le Bearer token
4. Extraire et retourner `{ id, name, artist, albumCover }` du premier résultat

### Variables d'environnement Netlify

| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Client ID de l'app Spotify Developer |
| `SPOTIFY_CLIENT_SECRET` | Client Secret de l'app Spotify Developer |
| `SPOTIFY_REFRESH_TOKEN` | Refresh token OAuth généré une fois manuellement |

### Réponse

```json
{
  "id": "3n3Ppam7vgaVa1iaRUIOKE",
  "name": "Mr. Brightside",
  "artist": "The Killers",
  "albumCover": "https://i.sdjpg"
}
```

### Erreurs

- Param invalide → 400
- Échec token refresh → 502
- Échec Spotify API → 502
- Pas de tracks trouvés → 404

---

## Style

Suit les design tokens existants (`src/styles/_tokens.scss`). Le widget s'intègre comme une nouvelle section en bas de la page Passions, après les sections Sports et Autres.

- Sélecteur : 3 boutons inline, actif avec `--color-accent-primary` (border + couleur texte), inactif avec `--color-text-secondary`
- Skeleton : rectangle animé avec `--color-bg-surface` + shimmer
- Pas de dépendances CSS extérieures

---

## Prérequis avant implémentation

1. Créer une app sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Générer un `refresh_token` via le flow OAuth Authorization Code (one-shot, script fourni ou Postman)
3. Configurer les 3 env vars dans Netlify Dashboard
