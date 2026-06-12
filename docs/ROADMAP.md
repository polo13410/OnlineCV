# Roadmap — petites touches pour rendre le site vivant

Principe : **une feature = une branche = un cycle complet** (brainstorm/spec → plan → implémentation → PR).
Ce document ne fixe que les intentions ; chaque feature sera designée en détail au moment de la démarrer.

Ordre suggéré : du quick-win vers la refonte, chaque étape préparant la suivante.

**Principe de placement (décidé 2026-06-12)** : le contenu vivant est visible par défaut, jamais caché derrière un hover.
- *Now playing* (live) → mini-chip en bas de **sidebar**, visible sur toutes les pages ; disparaît totalement quand rien ne joue ; clique vers la section musique de Passions
- *Musiques du moment* (widget complet) → reste dans Passions ; la refonte (feature 4) l'absorbe : « Musique » devient une catégorie flottante dont la distribution de cartes projette le widget (déjà au format carte 152px)
- *GitHub* → pas de section dédiée : tags sur les cartes skills (feature 3) ; en bonus optionnel, micro-badge « site mis à jour il y a X jours » en bas de sidebar

---

## 1. Spotify « en train d'écoute » — `feat/spotify-now-playing`

**Intention :** au chargement, si une lecture Spotify est en cours, un **mini-chip discret
en bas de sidebar** affiche « 🎧 en ce moment » avec le titre joué (pochette + titre, clique
vers Passions) ; quand rien ne joue, le chip disparaît. Le widget Passions garde son
comportement actuel (top tracks / dernier like).

- Nouvel appel `/me/player/currently-playing` dans la function Netlify existante
- Cache CDN court (30–60 s) pour ce mode — le quota free plan reste très loin (≪ 125k invocations/mois)
- Un seul appel par chargement de page, pas de polling
- ⚠️ Prérequis : régénérer le refresh token avec le scope `user-read-currently-playing` en plus

## 2. Tilt 3D sur les tiles — `feat/tilt-tiles`

**Intention :** micro-interaction de perspective au survol (la tile s'incline en suivant la souris),
dans l'esprit du curseur custom.

- Directive partagée réutilisable (`appTilt`), appliquée aux tiles Passions et Skills
- Sert de fondation à la refonte navigation (feature 4)
- Respecter `prefers-reduced-motion`

## 3. Section GitHub dans Skills — `feat/github-activity`

**Intention :** enrichir les skills avec mon activité GitHub réelle — tags des technos/langages
réellement utilisés récemment, dérivés de mes commits publics.

- API GitHub publique (pas de secret, pas d'OAuth) ; éventuellement une function + cache CDN
  pour éviter le rate-limit côté visiteur
- Les données alimentent des **tags** sur les compétences (« utilisé récemment », langages de la semaine…)
- Pensé pour être réutilisé par les cartes de la feature 4

## 4. Navigation « distribution de cartes » pour Skills (et Passions) — `feat/skills-constellation`

**Intention :** remplacer les grilles statiques par une navigation dynamique :

- **Tiles de catégories flottantes** ; au survol : tilt 3D + apparition en arrière-plan
  des 2-3 premières tiles de la catégorie, floutées et transparentes (signal « cliquable / développable »)
- **Au clic :** projection des compétences sur l'écran avec une animation fluide type
  distribution de cartes ; formes plus rondes, **taille proportionnelle aux années d'expérience**
- **Navigation retour** pour replier et explorer les autres catégories
- Réutilise la directive tilt (feature 2) et les tags GitHub (feature 3)
- La plus grosse feature : brainstorm dédié avec mockups avant toute implémentation

---

## Backlog / plus tard

- Heure locale + statut de disponibilité dans la sidebar (audience lausannoise — peu utile pour l'instant)
- Thème clair/sombre automatique selon l'heure du visiteur (le toggle garde la main)

## Abandonné

- Widget Strava (je ne cours pas 🏃❌)
