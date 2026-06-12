# Design — Navigation « constellation » pour Skills (et Passions)

**Date :** 2026-06-12
**Branche :** `feat/skills-constellation`
**Feature roadmap :** n°4 (`docs/ROADMAP.md`)
**Statut :** validé en brainstorm (mockups visuels + choix techniques)

## Intention

Remplacer les grilles statiques des pages Skills et Passions par une navigation
dynamique : des tiles de catégories flottantes en « constellation » qui, au clic,
projettent leurs compétences à l'écran sous forme de bulles dont la taille est
proportionnelle aux années d'expérience.

## Décisions de design (validées via mockups)

| Sujet | Décision |
|---|---|
| État repos | **Constellation** : tiles dispersées organiquement, reliées par de fins traits SVG, flottement doux, légère rotation propre à chaque tile |
| Hover (desktop) | La tile s'élève/s'illumine (hook du futur tilt 3D, feature 2) + 2-3 premières cartes apparaissent **floutées** derrière (signal « développable ») |
| État déployé | **Mini-constellation orbitale** : la catégorie devient le nœud central, les compétences gravitent autour en **bulles rondes** reliées par des traits ; taille ∝ années d'expérience |
| Autres catégories (déployé) | Visibles en périphérie, **floutées mais cliquables** (changement direct de catégorie) |
| Contenu des bulles | **Minimal** : nom + années. Clic → **panneau détail** (phrase de niveau, futurs tags GitHub) ; les autres bulles s'estompent |
| Navigation retour | Bouton « ← retour » (déployé → repos), Échap remonte d'un état, clic hors panneau ferme le détail |
| Soft skills | 6e catégorie flottante comme les autres ; cartes sans années ni détail (taille par défaut, non cliquables) |
| Passions | 3 catégories : « Sports », « Autres », « Musique » ; la carte de « Musique » **est** le widget Spotify 152px existant (projection de template) |
| Mobile | Mêmes états et interactions, tap = déploiement direct (pas de preview hover), layouts compacts dédiés, panneau détail en bottom-sheet |
| Dépendances roadmap | Aucune : le tilt 3D (feature 2) se greffera sur la tile après coup ; les tags GitHub (feature 3) rempliront `tags` dans le panneau détail |

## Approche technique retenue

**Slots précalculés + CSS/FLIP** (vs simulation de forces d3, vs canvas/WebGL —
écartés : dépendance, non-déterminisme, complexité accessibilité).

- Layouts déterministes par nombre d'éléments : gabarits de positions (en % du
  conteneur) avec jitter pseudo-aléatoire **seedé par id** → organique mais stable
  entre visites, anti-chevauchement par construction.
- Morphs repos ↔ déployé en **FLIP** (mesure avant/après, animation du delta en
  `transform` uniquement).
- Distribution des bulles : keyframes translate+scale depuis le centre, délais en
  cascade (~80-120 ms).
- Aucun package ajouté.

## Architecture

```
src/app/shared/constellation/
├── constellation.component.ts        # composant générique standalone
├── constellation.component.html/scss
├── constellation-layout.service.ts   # fonctions pures de calcul de slots
├── constellation-card.directive.ts   # marqueur de template projeté (ex. Spotify)
└── constellation.types.ts            # ConstellationCategory / ConstellationCard
```

### Contrat du composant générique

```ts
interface ConstellationCategory {
  id: string
  label: string
  cards: ConstellationCard[]
}

interface ConstellationCard {
  id: string
  title: string
  years?: number        // taille de bulle ; absent → taille par défaut
  meta?: string         // sous-texte court (ex. "6 années", localisé)
  detail?: string       // phrase longue → panneau détail ; absent → non cliquable
  tags?: string[]       // futurs tags GitHub (feature 3) ; vide pour l'instant
  templateId?: string   // carte custom projetée (ex. 'spotify')
}
```

- Le composant ne connaît ni les skills ni les passions : `SkillsComponent` et
  `PassionsComponent` deviennent des adaptateurs (mapping données → catégories +
  `<app-constellation>`).
- Cartes custom par content projection :
  `<ng-template appConstellationCard="spotify">` → le widget Spotify est rendu
  tel quel comme carte de la catégorie « Musique » (pas de panneau détail).
  Les cartes à `templateId` gardent leur format propre (rectangulaire 152px pour
  Spotify) : elles participent à la distribution orbitale mais ne sont pas
  contraintes à la forme ronde ni à l'échelle `years`.
- Échelle des bulles : `years` → diamètre borné [min, max] calculé par le layout
  service (le min reste lisible, le max ne domine pas l'écran).

### Machine à états (signals)

```
'rest' ──clic tile──▶ 'deployed(categoryId)' ──clic bulle (si detail)──▶ 'detail(cardId)'
  ▲                        │      ▲                                          │
  └──────« retour »────────┘      └────Échap / clic ailleurs / retour────────┘
                  (clic catégorie périphérique : deployed → deployed directement)
```

### Modèle de données (extension rétrocompatible)

```ts
export interface Skill {
  lang: string
  time: string          // conservé : affichage localisé ("6 années")
  level: string         // conservé : phrase longue → panneau détail
  years: number         // NOUVEAU : valeur numérique (taille de bulle)
  levelKey?: 'advanced' | 'intermediate' | 'beginner'  // NOUVEAU
}
```

- `years` et `levelKey` ajoutés aux ~27 skills de `content.ts` (dupliqués fr/en
  comme le reste de la structure).
- `getLevelClass()` (matching de chaînes fragile dans `skills.component.ts`) est
  supprimé au profit de `levelKey`.

## Accessibilité & motion

- Tiles et bulles : `role="button"`, `tabindex`, activation clavier (Entrée),
  Échap remonte d'un état ; focus visible.
- `prefers-reduced-motion` : flottement désactivé, distributions remplacées par
  des fondus ; tous les états restent atteignables.
- Le DOM reste sémantique (pas de canvas) : i18n via ngx-translate inchangé,
  contenu indexable.

## Tests

- **ConstellationLayoutService** (pur) : slots dans les bornes, déterminisme du
  seed, pas de chevauchement, échelle des diamètres bornée.
- **Composant** : transitions d'états (clic tile, clic bulle, Échap, retour,
  changement direct de catégorie), rendu d'un template projeté, cartes sans
  `detail` non cliquables.
- **Adaptateurs** : mapping skills → catégories (dont soft skills sans années),
  mapping passions → 3 catégories avec carte Spotify `templateId`.

## Hors périmètre (explicitement)

- Tilt 3D au survol (feature 2 — se greffera sur la tile de catégorie)
- Tags GitHub réels (feature 3 — rempliront `ConstellationCard.tags`)
- Deep-linking de l'état déployé dans l'URL
- Toute nouvelle dépendance npm

## Référence visuelle

Mockups du brainstorm conservés dans `.superpowers/brainstorm/530-1781287601/content/`
(non versionnés) : `layout-constellation-v2.html` (repos + hover),
`deployed-state-v2.html` option B (orbital), `bubble-content.html` option C
(bulle + panneau détail).
