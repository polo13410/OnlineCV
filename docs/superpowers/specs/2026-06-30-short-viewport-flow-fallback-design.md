# Repli en mode flow sur écran court — Design

**Date :** 2026-06-30
**Branche :** `fix/150pc-low-res-display`
**Composant touché :** `src/app/shared/magnetic-scroll/magnetic-scroll.component.{ts,html}`

## Problème

Sur un écran 1080p avec mise à l'échelle Windows à 150 %, le viewport CSS effectif
tombe à ~1280×720 px (tout divisé par 1,5). C'est la **hauteur** qui pose problème :
la zone utile passe d'environ 1028 px à environ 668 px.

Le composant `magnetic-scroll` présente une carte à la fois, centrée dans une scène
de hauteur `calc(100vh - var(--header-height))` avec `overflow: hidden`. Chaque carte
est en `position: absolute` et son corps n'a aucun scroll interne
(`.ms-card { overflow: hidden }`).

Conséquence : une carte dont la hauteur intrinsèque dépasse celle de la scène est
centrée puis **coupée en haut et en bas** par le `overflow: hidden`, sans aucun moyen
pour l'utilisateur d'atteindre le contenu masqué. Les cartes riches (ex. « Technical
Lead », ~15 puces) débordent dès que le viewport est court.

## Décision retenue

Réutiliser le rendu **flow** (liste à scroll natif) qui existe déjà dans le composant
pour le mobile, et l'activer aussi quand l'écran est trop court pour le mode carte.
Le mode flow n'a pas le problème de débordement : scroll natif, tout le contenu est
atteignable.

Le déclenchement se fait par **mesure dynamique** (pas par seuil fixe) : on bascule
exactement quand la carte la plus haute ne tient pas dans la scène, et nulle part
ailleurs. Cela s'adapte automatiquement au contenu et à la langue (FR/EN changent les
hauteurs).

## Architecture

### Signal de décision

Le composant a déjà un signal `isMobile` (alimenté par
`matchMedia('(max-width: 768px)')`) qui pilote le `@if` du template entre rendu
desktop (magnetic) et rendu mobile (flow).

On ajoute un signal `tooTall`, et un computed qui devient la condition de rendu :

```ts
useFlow = computed(() => isMobile() || tooTall());
```

- Template : `@if (isMobile())` → `@if (useFlow())`.
- Tous les tests `!isMobile()` qui conditionnent le setup desktop deviennent `!useFlow()`.

### Calcul de `tooTall`

Calculé à la fin de `scheduleMeasureAndRender`, juste après `measureAllHeights()`
(déjà existant) :

```
availableH = stage.clientHeight - SAFETY      // SAFETY ≈ 24px de respiration
tooTall    = max(this.heights) > availableH
```

On compare la carte **la plus haute** (pas chaque carte) : si une seule déborde, on
bascule toute la section en flow pour une UX cohérente, plutôt que d'avoir un mélange
de cartes OK et de cartes coupées.

La dernière valeur de `max(this.heights)` est mise en cache (champ privé), car les
hauteurs ne dépendent que de la **largeur** de la scène (wrapping du texte) et du
contenu — jamais de sa hauteur.

### Cycle de vie et bascule réactive

Piège : pour mesurer les cartes desktop, le DOM desktop doit être monté, donc
`useFlow` doit être `false` au moment de la mesure. Séquence :

1. **Init** (largeur desktop) : on rend le desktop par défaut → le double-RAF mesure
   → si trop haut, `tooTall` passe à `true` → le template bascule en flow. Le flip a
   lieu pendant l'animation `ms-fade-in` (0,5 s), donc quasi invisible.
2. **Resize hauteur seule** (cas Windows 150 % / fenêtre rétrécie) : la largeur ne
   change pas → le cache `maxCardHeight` reste valide → on recompare au nouveau
   `availableH` et on toggle `tooTall`. Pas de re-mesure nécessaire.
3. **Resize largeur** : le cache de hauteurs peut être faux. On repasse optimiste en
   desktop (`tooTall = false`), le double-RAF re-mesure et redécide. Un flash est
   possible mais seulement sur changement de largeur (rare) et il s'auto-corrige.

Le changement de couche active (desktop ⇄ flow) implique d'attacher/détacher les bons
listeners. Aujourd'hui ils sont posés une seule fois dans `ngAfterViewInit`. On
remplace ce câblage one-shot par une méthode idempotente **`syncLayout()`**, déclenchée
par un `effect` sur `useFlow()` :

- Gardée par un champ `wiredMode: 'desktop' | 'flow' | null`.
- Quand la couche active change : détache les listeners de l'ancienne, attache ceux de
  la nouvelle (events molette/touch desktop, ou scroll mobile), lance la mesure si on
  (re)passe en desktop.
- Idempotente : appelée plusieurs fois pour la même couche, ne refait rien.

Ce choix réactif (vs un sens unique desktop→flow) est retenu pour la **cohérence** :
le composant gère déjà le changement de largeur dans les deux sens via le listener
`matchMedia`. Un repli hauteur en sens unique créerait une asymétrie (rétrécir/élargir
la largeur fonctionne, mais rétrécir/élargir la hauteur coincerait l'utilisateur en
flow).

## Périmètre

**Inclus :**
- Bascule desktop → flow quand la carte la plus haute déborde la scène.
- Retour propre desktop quand l'écran rallonge (réactif dans les deux sens).
- Remplacement du câblage one-shot des listeners par `syncLayout()` idempotent.

**Hors scope (follow-up sur branche dédiée) :**
- `attachMobileEvents()` est **défini mais jamais appelé** : l'effet de blur/scale au
  focus du rendu mobile est dormant aujourd'hui. Le mode flow fonctionne sans (scroll
  natif simple, ce qui suffit à régler le débordement). Le réveiller changerait aussi
  l'UX des vrais mobiles → décision et test séparés.

## Tests

- **Manuel (principal) :** DevTools en émulant 1280×720 ; vérifier qu'une carte riche
  bascule en flow et que tout le contenu est atteignable ; toggle FR/EN (change les
  hauteurs) ; resize hauteur et largeur pour valider les bascules dans les deux sens.
- **Unitaire (si la base de tests le permet) :** extraire la règle de décision
  (`max(heights) > availableH`) en fonction pure testable indépendamment du DOM.

## Risques

- `syncLayout()` est la seule modification structurelle (lifecycle des listeners) →
  partie la plus à risque, gardée petite et idempotente.
- Flash possible lors d'un resize **de largeur** pendant qu'on est en flow → toléré,
  événement rare, auto-correction immédiate.
