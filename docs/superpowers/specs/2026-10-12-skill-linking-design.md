# Compétences reliées aux expériences — Design

**Date :** 2026-10-12
**Branche :** `feat/skill-linking`
**Pages touchées :** Compétences, Exp pro, Projets perso, Formation

## Intention

Rendre la page Compétences interactive : sélectionner une ou plusieurs compétences
affiche, dans un panneau latéral, les expériences (pro et perso) où elles ont été
utilisées ensemble. En parallèle, unifier le design des pages Exp pro, Projets perso
et Formation autour de la frise en quinconce des projets perso : l'app paraît plus
cohérente, le code est mutualisé, et le mobile y gagne.

Hors scope : liens partageables / URL par compétence (inutile ici), tags cliquables
sur les cartes des autres pages, soft skills (restent telles quelles).

---

## 1. Registre unique des compétences

Aujourd'hui les compétences sont des chaînes d'affichage par langue
(`'TypeScript (& JavaScript)'`) et les tags des projets sont un autre jeu de chaînes
libres. On introduit un registre unique, indépendant de la langue :

```ts
// src/assets/data/skills.ts
export const SKILLS = {
  typescript: { category: 'languages', label: 'TypeScript (& JavaScript)', years: 6, level: 'advanced' },
  agile:      { category: 'practices', label: { fr: 'Méthodes Agile', en: 'Agile methods' }, years: 5, level: 'advanced' },
  // ...
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;
```

- `label` : chaîne simple, ou `{ fr, en }` quand elle se traduit.
- `category` : id de catégorie ; le nom affiché passe par l'i18n (`SKILLS.CATEGORY.LANGUAGES`…).
- `years` : nombre ; « 6 années » / « 6 years » est formaté via l'i18n.
- `level` : `'advanced' | 'intermediate' | 'basics' | 'beginner'`. Remplace le parsing
  actuel de chaînes (`getLevelClass`).
- **Contexte « pro / perso » dérivé** : la mention « projets professionnels & personnels »
  n'est plus saisie à la main, elle est calculée à partir des expériences taguées.
- L'ordre des clés = ordre d'affichage dans chaque catégorie.

`SkillId` est un type : un tag inconnu sur une carte devient une **erreur de compilation**.

## 2. Modèle commun des expériences

Pro, stages, projets perso et formations partagent un même socle :

```ts
interface ExperienceBase {
  id: string;            // stable, sert d'ancre (#quanthome)
  icon?: string;         // asset ; sinon pastille avec l'initiale
  dateFrom: string;      // ISO 'YYYY-MM', trie la frise
  dateTo?: string;       // ISO ; absent = « Aujourd'hui »
  skills: SkillId[];
}
```

Chaque type garde ses champs propres (entreprise/lieu/puces pour le pro, statut/liens/
dernière MAJ GitHub pour le perso, école pour la formation). Les dates texte actuelles
(`'Octobre 2024'`) sont remplacées par de l'ISO formaté via `Intl` comme sur la page projets.

Le contenu reste dans `content.ts` par langue (texte traduit). Les champs neutres
(`id`, `dateFrom`, `skills`, `icon`, liens) sont dupliqués FR/EN comme aujourd'hui pour
les projets ; **un test unitaire vérifie que FR et EN ont les mêmes ids, dates et skills**
pour empêcher toute dérive.

## 3. Composants partagés

- **`ExperienceCardComponent`** (`shared/experience-card`) — la carte des projets perso,
  généralisée : icône, titre, sous-titre (entreprise · lieu), badge statut, texte ou puces,
  tags de compétences, liens. Deux variantes :
  - `full` : pages Exp pro / Projets / Formation. Les puces au-delà de 4 sont repliées
    derrière « Voir plus » (Quanthome en a 15).
  - `compact` : panneau latéral. Icône, titre, sous-titre, période, tags — sans description.
    Les tags des compétences sélectionnées sont mis en évidence.
- **`TimelineComponent`** (`shared/timeline`) — la frise en quinconce actuelle (ligne
  centrale, points, alternance gauche/droite, mobile à gauche), extraite de
  `projects.component`. Reçoit des entrées `{ meta: {label, value}[], card }`. La colonne
  méta affiche :
  - pro / stages / formation : période (« Oct. 2024 → Aujourd'hui ») + durée ;
  - projets perso : « Créé en » + « Dernière mise à jour » (inchangé).

Pages après refonte :

| Page | Sections | Frise |
|---|---|---|
| Exp pro | Expériences pro, puis Stages | une frise par section |
| Projets perso | inchangée visuellement, migrée sur les composants partagés | une frise |
| Formation | Formations | une frise |

**Le composant `magnetic-scroll` n'a plus d'utilisateur** : il est supprimé avec son spec
et les interfaces `MagneticScroll*` (récupérables dans l'historique git).

## 4. Page Compétences interactive

### Règles de sélection

Soit `S` l'ensemble sélectionné et `R(S)` les expériences qui utilisent **toutes** les
compétences de `S` (pro + stages + perso ; la formation n'est pas incluse).

| Action | Résultat |
|---|---|
| `S` vide | tout est cliquable, pas de panneau |
| clic sur une compétence **cliquable** non sélectionnée | `S ← S ∪ {c}` |
| clic sur une compétence **grisée** | `S ← {c}` (reset) |
| clic sur une compétence **sélectionnée** | `S ← S \ {c}` ; panneau fermé si `S` vide |
| ✕ du panneau | `S ← ∅` |

- Une compétence est **cliquable** si `S` est vide, ou si au moins une expérience de
  `R(S)` l'utilise. Sinon elle est **grisée** (opacité réduite + désaturée), mais reste
  cliquable pour le reset.
- Conséquence : `R(S)` n'est jamais vide une fois `S` construit par ajouts.
- Une compétence qu'aucune expérience n'utilise est grisée dès le départ ; la cliquer
  ouvre le panneau avec un message « Pas encore d'expérience associée ».
- La logique est une fonction pure (`skill-selection.ts`), testée unitairement.

### Panneau latéral

- **Desktop** : panneau fixe à droite (~380 px), la grille des compétences se rétrécit.
  En-tête : chips des compétences sélectionnées + ✕.
- **Mobile** : panneau en bas d'écran (bottom sheet), hauteur ~60 vh, scroll interne.
- Contenu : groupe **Professionnel** (pro + stages) puis **Personnel**, chaque groupe trié
  par date (plus récente d'abord), cartes en variante `compact`.
- Clic sur une carte : navigation vers sa page avec ancre (`/experiences#quanthome`),
  scroll jusqu'à la carte + bref surlignage.
- Respect de `prefers-reduced-motion` pour l'ouverture du panneau.

---

## 5. Tags par expérience



| Expérience | Compétences |
|---|---|
| **Quanthome** (2024 → auj.) | TypeScript, Node.js, SQL, GCP, CI/CD, Architecture applicative, Tests & qualité, MCP, RAG, IA agentique, Docker, Terraform, React, Agile |
| **Propulselab** (2023 → 2024) ✅ | TypeScript, Python, PHP, HTML/CSS, Node.js, Vue.js, Laravel, CI/CD, Terraform, Docker, AWS, Agile, Tests & qualité, Architecture applicative |
| **Metafactory** (2020 → 2022) | C#, .NET, HTML/CSS, Agile, Tests & qualité |
| **Monext** — stage (2020) | Angular, TypeScript, HTML/CSS, Java |
| **Thales Alenia Space** — stage (2018–19) | Java |
| **Cosmos Consulting** — stage (2018) | Java, HTML/CSS, TypeScript (& JavaScript) |
| **Chop Chop Save Converter** | Python, CI/CD |
| **Kamadvice** | React, TypeScript, HTML/CSS, Netlify, Supabase, Tailwind |
| **VP Dietetic Center** | React, TypeScript, Node.js, Docker, GCP, Terraform, CI/CD, NestJS, SQL, Prisma |
| **Online CV** | Angular, TypeScript, HTML/CSS, Netlify, Node.js |

GitHub Actions / CircleCI / SeedCI restent regroupés sous la compétence **CI/CD** (son
libellé les cite déjà), Terraform Cloud sous **Terraform (IaC)**.

Compétence sans aucune expérience : **Spring** → grisée dès le départ.

### Nouvelles compétences (valeurs proposées, à valider)

| Compétence | Catégorie | Années | Niveau |
|---|---|---|---|
| SQL (PostgreSQL, MySQL, MS SQL) | Bases de données *(nouvelle catégorie)* | 9 | bon niveau |
| Prisma | Bases de données | 1 | bonnes bases |
| Supabase | Bases de données | 1 | bonnes bases |
| NestJS | Frameworks & librairies | 1 | intermédiaire |
| Tailwind CSS | Frameworks & librairies | 1 | bonnes bases |

## 6. Décisions

1. ✅ Tous les tags confirmés.
2. ✅ Supabase, Tailwind, NestJS, Prisma ajoutées ; PostgreSQL devient « SQL (PostgreSQL, MySQL, MS SQL) », pratiqué depuis 2017.
3. ✅ Logos fournis dans `assets/pictures/experiences/`, normalisés (marges rognées,
   96 px de haut, PNG) ; Quanthome recadré sur son « Q ». Les logos sont affichés dans
   une **tuile blanche** (hauteur fixe 36 px, largeur auto ≤ 120 px) pour rester lisibles
   en thème sombre et absorber les ratios très différents (Thales ≈ 8:1, carrés…).
   Les icônes des projets perso utilisent la même tuile.
4. ✅ Contexte « pro / perso » dérivé des tags.

## 7. Découpage proposé

1. Registre `skills.ts` + migration de la page Compétences (rendu identique, pas encore interactive).
2. `ExperienceCardComponent` + `TimelineComponent`, migration de Projets perso (rendu identique).
3. Migration Exp pro + Formation (dates ISO, tags), suppression de `magnetic-scroll`.
4. Logique de sélection (fonction pure + tests), panneau latéral desktop puis mobile.
5. Navigation carte → ancre, finitions, mise à jour du ROADMAP (les features 3 et 4 réutiliseront ce registre).
