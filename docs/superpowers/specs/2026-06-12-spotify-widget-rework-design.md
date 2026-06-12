# Spotify Widget Rework — Design Spec

**Date:** 2026-06-12
**Page cible:** Passions
**Statut:** Approuvé
**Remplace:** l'UI décrite dans `2026-06-11-spotify-widget-design.md` (l'architecture Netlify reste)

---

## Problème

Le widget actuel affiche l'iframe Spotify en permanence : boîte noire brandée Spotify (couleurs, polices, rayons à elle) qui ignore les design tokens du site (steel-blue/teal, DM Sans, thèmes clair/sombre). Résultat : le widget paraît plaqué, pas intégré.

## Solution retenue (validée via mockups)

**Carte hybride** : carte 100% native au repos, lecteur Spotify embarqué à la demande (swap sur place), avec un 4ᵉ onglet « ♥ Dernier like ».

---

## UI / Comportement

### Sélecteur

4 pills, styles actuels conservés :

| Pill | Valeur | Source |
|------|--------|--------|
| Cette semaine | `short_term` | `/me/top/tracks` |
| Ce mois-ci | `medium_term` | `/me/top/tracks` |
| Depuis toujours | `long_term` | `/me/top/tracks` |
| ♥ Dernier like | `liked` | `/me/tracks?limit=1` |

Labels i18n existants (`SPOTIFY_WEEK/MONTH/ALL`) conservés ; nouvelle clé `SPOTIFY_LIKED` (fr : « ♥ Dernier like », en : « ♥ Latest like »).

### État repos — carte native

- Conteneur : `--color-bg-surface`, `border: 1px solid --color-border`, `--border-radius-md`, padding `--space-4`, ombre `--glow-subtle`.
- Pochette album 64px, `--border-radius-sm`, overlay ▶ circulaire **toujours visible** (pas de hover requis, mobile ok).
- Overline en `--font-mono` (Martian Mono), uppercase, muted : `#1 · cette semaine` / `#1 · ce mois-ci` / `#1 · depuis toujours` / `♥ dernier like` (clés i18n).
- Titre du track : `--color-text-primary`, semi-bold. Artiste : `--color-text-secondary`.
- Lien discret « Spotify ↗ » (coin bas-droit) vers `https://open.spotify.com/track/{id}` — attribution requise + deep link. `target="_blank" rel="noopener"`.
- Hover carte : bordure `--color-border-accent` + `--glow-subtle` (transition `--transition-base`).

### État lecture — swap sur place

- Clic sur ▶ : la carte est remplacée **dans le même emplacement** (hauteur identique, pas de layout shift) par le lecteur compact Spotify.
- **Un seul clic démarre la musique** : utilisation de l'[iFrame Embed API](https://developer.spotify.com/documentation/embeds/references/iframe-api) officielle — script `https://open.spotify.com/embed/iframe-api/v1` chargé **paresseusement au premier clic ▶**, puis `createController` + `play()` (le clic est un user gesture, l'autoplay est autorisé).
- Bouton × flottant (coin haut-droit du conteneur) : détruit le controller, retourne à la carte.
- Changement de pill pendant la lecture : détruit le lecteur, retourne en mode carte (avec fetch du nouveau track).

### États skeleton / erreur

- Même empreinte que la carte (pas de saut de layout).
- Skeleton shimmer existant conservé, ajusté à la hauteur de la carte.
- Message d'erreur : actuellement codé en dur « Spotify indisponible » → clé i18n `SPOTIFY_ERROR` (fr/en).

### Emplacement

Inchangé : dernière section de la page Passions, avec son header de section actuel.

---

## Composant — `SpotifyWidgetComponent`

- `TimeRange` devient `'short_term' | 'medium_term' | 'long_term' | 'liked'` (renommage éventuel en `TrackSelection`).
- Nouveau signal `playing: boolean` (ou état `'card' | 'player'`).
- Le flux HTTP existant (Subject + switchMap + takeUntilDestroyed) est conservé ; seule l'URL change : `/.netlify/functions/spotify-top-track?time_range={selection}`.
- `embedUrl`/iframe statique supprimés au profit du Embed API controller (géré dans un service ou directement dans le composant ; le script n'est chargé qu'une fois).
- La carte native est rendue à partir de `track()` (`name`, `artist`, `albumCover`, `id`) — données déjà retournées par la fonction.

## Netlify Function — `spotify-top-track`

- Accepte `time_range=liked` en plus des trois valeurs existantes.
- `liked` → `GET https://api.spotify.com/v1/me/tracks?limit=1` ; mapping de l'item `{ track }` vers la même forme de réponse `{ id, name, artist, albumCover }`.
- Erreurs : mêmes codes (400 param invalide, 404 vide, 502 amont).

## Prérequis manuel (Paul)

Régénérer le refresh token Spotify avec les scopes `user-top-read` **et** `user-library-read`, le mettre à jour dans les env vars Netlify et le `.env` local. Sans ça, le pill « Dernier like » renverra l'état erreur (pas de cas spécial côté front).

## Tests

- Specs composant existants adaptés (4 pills, rendu carte au lieu d'iframe).
- Nouveaux tests : swap carte→lecteur au clic ▶ (mock du Embed API), × retourne à la carte, changement de pill en lecture retourne à la carte, état erreur i18n.
- Fonction Netlify : pas de harnais de test actuellement — vérification manuelle du mode `liked`.
