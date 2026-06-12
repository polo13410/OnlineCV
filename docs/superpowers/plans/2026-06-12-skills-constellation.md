# Navigation Constellation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les grilles statiques des pages Skills et Passions par un composant générique `ConstellationComponent` : tiles de catégories flottantes (état repos), projection orbitale de bulles ∝ années d'expérience (état déployé), panneau détail au clic.

**Architecture:** Composant standalone Angular 21 à signals, positionnement par slots déterministes calculés par un service pur (`ConstellationLayoutService`), morphs via transitions CSS sur `transform` uniquement (custom props `--x`/`--y` + unités container-query `cqw`/`cqh` — même objectif que FLIP, sans mesure JS puisque les positions cibles sont connues). Cartes custom (widget Spotify) par content projection.

**Tech Stack:** Angular 21 (signals, `input()`, `contentChildren()`, control flow `@for`/`@if`), Karma/Jasmine, SCSS avec tokens existants, ngx-translate. **Aucune dépendance ajoutée.**

**Spec:** `docs/superpowers/specs/2026-06-12-skills-constellation-design.md`
**Branche:** `feat/skills-constellation` (déjà créée)

**Raffinements vs spec (validés par cohérence, à ne pas re-discuter) :**
- Le morph FLIP est réalisé en pur CSS (`transform: translate(calc(var(--x)*1cqw - 50%), …)` + transition) : les slots étant déterministes, aucune mesure avant/après n'est nécessaire. Même garantie : animation sur `transform` seul.
- `ConstellationCard` gagne `emphasis?: 'high' | 'medium' | 'low'` (projection neutre de `levelKey`) : teinte la bordure des bulles. `levelKey` reste dans les données, l'adaptateur Skills fait le mapping.

**Commandes de test (Windows PowerShell) :**
- Test ciblé : `npx ng test --watch=false --browsers=ChromeHeadless --include="**/<fichier>.spec.ts"`
- Suite complète : `npx ng test --watch=false --browsers=ChromeHeadless`
- Build : `npx ng build`

---

### Task 1: Modèle de données — types constellation + `years`/`levelKey` sur les skills

**Files:**
- Create: `src/app/shared/constellation/constellation.types.ts`
- Create: `src/assets/data/content.spec.ts`
- Modify: `src/assets/data/contentInterface.ts` (interface `Skill`)
- Modify: `src/assets/data/content.ts` (25 skills × 2 langues)

- [ ] **Step 1: Créer les types du composant générique**

Créer `src/app/shared/constellation/constellation.types.ts` :

```ts
export interface ConstellationCard {
  id: string;
  title: string;
  /** Taille de bulle ; absent → taille par défaut (soft skills, passions) */
  years?: number;
  /** Sous-texte court localisé (ex. "6 années") */
  meta?: string;
  /** Phrase longue → panneau détail ; absent → bulle non cliquable */
  detail?: string;
  /** Futurs tags GitHub (feature 3) ; vide pour l'instant */
  tags?: string[];
  /** Carte custom projetée via ng-template (ex. 'spotify') */
  templateId?: string;
  /** Teinte de la bulle (projection de levelKey) */
  emphasis?: 'high' | 'medium' | 'low';
}

export interface ConstellationCategory {
  id: string;
  label: string;
  cards: ConstellationCard[];
}

export type ConstellationState =
  | { kind: 'rest' }
  | { kind: 'deployed'; categoryId: string }
  | { kind: 'detail'; categoryId: string; cardId: string };
```

- [ ] **Step 2: Écrire le test de complétude des données (doit échouer)**

Créer `src/assets/data/content.spec.ts` :

```ts
import { content } from './content';

describe('content skill data', () => {
  it('every skill has years >= 1 and a valid levelKey', () => {
    for (const langData of content) {
      for (const category of langData.skillCategories) {
        for (const skill of category.skills) {
          const ctx = `${langData.language} / ${category.name} / ${skill.lang}`;
          expect(skill.years).withContext(ctx).toBeGreaterThanOrEqual(1);
          expect(['advanced', 'intermediate', 'beginner'])
            .withContext(ctx)
            .toContain(skill.levelKey as string);
        }
      }
    }
  });

  it('fr and en agree on years and levelKey for each skill position', () => {
    const [fr, en] = content;
    expect(fr.skillCategories.length).toBe(en.skillCategories.length);
    fr.skillCategories.forEach((frCat, ci) => {
      frCat.skills.forEach((frSkill, si) => {
        const enSkill = en.skillCategories[ci].skills[si];
        expect(frSkill.years).withContext(frSkill.lang).toBe(enSkill.years);
        expect(frSkill.levelKey).withContext(frSkill.lang).toBe(enSkill.levelKey);
      });
    });
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/content.spec.ts"`
Expected: FAIL — erreur de compilation (`years` n'existe pas sur `Skill`).

- [ ] **Step 4: Étendre l'interface `Skill`**

Dans `src/assets/data/contentInterface.ts`, remplacer :

```ts
export interface Skill {
  lang: string
  time: string
  level: string
}
```

par :

```ts
export interface Skill {
  lang: string
  time: string          // affichage localisé ("6 années")
  level: string         // phrase longue → panneau détail
  years: number         // valeur numérique (taille de bulle)
  levelKey: 'advanced' | 'intermediate' | 'beginner'
}
```

- [ ] **Step 5: Ajouter `years` et `levelKey` aux 25 skills, dans les DEUX blocs de langue de `content.ts`**

Valeurs exactes (identiques fr/en ; `years` = numérique du champ `time` existant) :

| Catégorie | Skill | years | levelKey |
|---|---|---|---|
| Langages | TypeScript (& JavaScript) | 6 | advanced |
| Langages | C# | 3 | intermediate |
| Langages | Java | 3 | intermediate |
| Langages | Python | 4 | intermediate |
| Langages | PHP | 1 | beginner |
| Langages | HTML / CSS | 5 | intermediate |
| Frameworks | Node.js | 5 | advanced |
| Frameworks | .NET | 2 | intermediate |
| Frameworks | Spring | 1 | beginner |
| Frameworks | Vue.js | 3 | intermediate |
| Frameworks | Angular | 1 | beginner |
| Frameworks | React | 3 | intermediate |
| Frameworks | Laravel | 1 | beginner |
| DevOps | CI/CD (GitHub Actions, CircleCI, SeedCI) | 4 | intermediate |
| DevOps | Terraform (IaC) | 2 | intermediate |
| DevOps | Docker | 2 | intermediate |
| DevOps | AWS | 3 | advanced |
| DevOps | Google Cloud Platform | 2 | advanced |
| DevOps | Netlify | 1 | beginner |
| Méthodes | Méthodes Agile / Agile | 5 | advanced |
| Méthodes | Tests & qualité / Testing | 4 | intermediate |
| Méthodes | Architecture applicative | 4 | intermediate |
| IA | MCP (Model Context Protocol) | 1 | advanced |
| IA | RAG (Retrieval-Augmented Generation) | 1 | intermediate |
| IA | IA Agentique / Agentic AI | 1 | advanced |

Format (exemple sur la première entrée, à appliquer partout) :

```ts
{
  lang: 'TypeScript (& JavaScript)',
  time: '6 années',
  level: 'projets professionnels & personnels : niveau avancé',
  years: 6,
  levelKey: 'advanced',
},
```

- [ ] **Step 6: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/content.spec.ts"`
Expected: PASS (2 specs).

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/constellation/constellation.types.ts src/assets/data/contentInterface.ts src/assets/data/content.ts src/assets/data/content.spec.ts
git commit -m "feat(constellation): types generiques + years/levelKey sur les skills"
```

---

### Task 2: `ConstellationLayoutService` — slots déterministes + `slugify`

**Files:**
- Create: `src/app/shared/constellation/constellation-layout.service.ts`
- Test: `src/app/shared/constellation/constellation-layout.service.spec.ts`

- [ ] **Step 1: Écrire les tests (doivent échouer)**

Créer `constellation-layout.service.spec.ts` :

```ts
import {
  ConstellationLayoutService,
  slugify,
} from './constellation-layout.service';

describe('slugify', () => {
  it('normalises accents, spaces and symbols', () => {
    expect(slugify('Méthodes & pratiques')).toBe('methodes-pratiques');
    expect(slugify('CI/CD (GitHub Actions, CircleCI, SeedCI)')).toBe(
      'ci-cd-github-actions-circleci-seedci'
    );
    expect(slugify('TypeScript (& JavaScript)')).toBe('typescript-javascript');
  });
});

describe('ConstellationLayoutService', () => {
  let service: ConstellationLayoutService;

  beforeEach(() => {
    service = new ConstellationLayoutService();
  });

  describe('restSlots', () => {
    it('is deterministic for a given seed', () => {
      expect(service.restSlots(6, 'skills')).toEqual(service.restSlots(6, 'skills'));
    });

    it('differs between seeds', () => {
      const a = JSON.stringify(service.restSlots(6, 'skills'));
      const b = JSON.stringify(service.restSlots(6, 'passions'));
      expect(a).not.toBe(b);
    });

    it('returns the requested count', () => {
      for (const n of [1, 3, 6, 8]) {
        expect(service.restSlots(n, 's').length).toBe(n);
      }
    });

    it('keeps slots within bounds (desktop and mobile)', () => {
      for (const variant of ['desktop', 'mobile'] as const) {
        for (const n of [2, 3, 6, 8]) {
          for (const slot of service.restSlots(n, 'seed', variant)) {
            expect(slot.x).toBeGreaterThanOrEqual(8);
            expect(slot.x).toBeLessThanOrEqual(92);
            expect(slot.y).toBeGreaterThanOrEqual(8);
            expect(slot.y).toBeLessThanOrEqual(92);
          }
        }
      }
    });

    it('keeps tiles separated (no overlap by construction)', () => {
      for (const n of [3, 4, 5, 6, 7, 8]) {
        const slots = service.restSlots(n, 'any-seed');
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            const d = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y);
            expect(d).withContext(`n=${n} pair ${i},${j}`).toBeGreaterThanOrEqual(14);
          }
        }
      }
    });
  });

  describe('orbitSlots', () => {
    it('places the first card at the top of the ring', () => {
      const slots = service.orbitSlots(6);
      expect(slots[0].x).toBeCloseTo(50, 0);
      expect(slots[0].y).toBeLessThan(50);
    });

    it('keeps all cards within bounds', () => {
      for (const n of [1, 3, 6, 8]) {
        for (const slot of service.orbitSlots(n)) {
          expect(slot.x).toBeGreaterThanOrEqual(8);
          expect(slot.x).toBeLessThanOrEqual(92);
          expect(slot.y).toBeGreaterThanOrEqual(8);
          expect(slot.y).toBeLessThanOrEqual(92);
        }
      }
    });
  });

  describe('peripherySlots', () => {
    it('returns slots on the outer ring, within bounds', () => {
      for (const slot of service.peripherySlots(5)) {
        const fromCenter = Math.hypot(slot.x - 50, slot.y - 50);
        expect(fromCenter).toBeGreaterThanOrEqual(40);
        expect(slot.x).toBeGreaterThanOrEqual(2);
        expect(slot.x).toBeLessThanOrEqual(98);
        expect(slot.y).toBeGreaterThanOrEqual(2);
        expect(slot.y).toBeLessThanOrEqual(98);
      }
    });
  });

  describe('bubbleDiameter', () => {
    it('maps max years to MAX and stays bounded', () => {
      expect(service.bubbleDiameter(6, 6)).toBe(service.MAX_DIAMETER);
      expect(service.bubbleDiameter(1, 6)).toBeGreaterThanOrEqual(service.MIN_DIAMETER);
      expect(service.bubbleDiameter(1, 6)).toBeLessThan(service.bubbleDiameter(3, 6));
    });

    it('falls back to the default for cards without years', () => {
      expect(service.bubbleDiameter(undefined, 6)).toBe(service.DEFAULT_DIAMETER);
    });
  });

  describe('previewOffsets', () => {
    it('returns at most 3 deterministic offsets', () => {
      expect(service.previewOffsets(3).length).toBe(3);
      expect(service.previewOffsets(2).length).toBe(2);
      expect(service.previewOffsets(3)).toEqual(service.previewOffsets(3));
    });
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation-layout.service.spec.ts"`
Expected: FAIL — module `./constellation-layout.service` introuvable.

- [ ] **Step 3: Implémenter le service**

Créer `constellation-layout.service.ts` :

```ts
import { Injectable } from '@angular/core';

export interface ConstellationSlot {
  x: number;        // % de la largeur du conteneur (centre de l'élément)
  y: number;        // % de la hauteur du conteneur
  rotation: number; // degrés
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG déterministe (mulberry32) — le seed garantit un layout stable entre visites */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gabarits desktop par nombre de tiles — séparation >= 28 garantie avant jitter (±3) */
const REST_TEMPLATES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [],
  [[50, 45]],
  [[32, 40], [68, 55]],
  [[24, 38], [54, 58], [80, 32]],
  [[22, 32], [62, 28], [36, 68], [76, 64]],
  [[20, 30], [52, 42], [82, 26], [30, 70], [68, 68]],
  [[18, 28], [48, 42], [80, 24], [22, 68], [50, 74], [78, 64]],
  [[16, 18], [44, 18], [72, 18], [30, 48], [58, 48], [86, 48], [32, 78]],
  [[16, 18], [44, 18], [72, 18], [30, 48], [58, 48], [86, 48], [18, 78], [46, 78]],
];

function mobileTemplate(count: number): ReadonlyArray<readonly [number, number]> {
  const rows: Array<readonly [number, number]> = [];
  const step = count > 1 ? 76 / (count - 1) : 0;
  for (let i = 0; i < count; i++) {
    rows.push([i % 2 === 0 ? 32 : 68, 12 + i * step]);
  }
  return rows;
}

@Injectable({ providedIn: 'root' })
export class ConstellationLayoutService {
  readonly MIN_DIAMETER = 68;
  readonly MAX_DIAMETER = 148;
  readonly DEFAULT_DIAMETER = 84;

  restSlots(
    count: number,
    seed: string,
    variant: 'desktop' | 'mobile' = 'desktop'
  ): ConstellationSlot[] {
    const rand = mulberry32(hashSeed(seed));
    let template: ReadonlyArray<readonly [number, number]>;
    if (variant === 'mobile') {
      template = mobileTemplate(count);
    } else if (count < REST_TEMPLATES.length) {
      template = REST_TEMPLATES[count];
    } else {
      // au-delà des gabarits : répartition en anneau
      return this.orbitSlots(count).map((slot) => ({
        ...slot,
        rotation: (rand() - 0.5) * 5,
      }));
    }
    return template.slice(0, count).map(([x, y]) => ({
      x: x + (rand() - 0.5) * 6,
      y: y + (rand() - 0.5) * 6,
      rotation: (rand() - 0.5) * 5,
    }));
  }

  orbitSlots(count: number): ConstellationSlot[] {
    const slots: ConstellationSlot[] = [];
    const rx = count <= 6 ? 30 : 35;
    const ry = count <= 6 ? 32 : 36;
    for (let i = 0; i < count; i++) {
      const angle = ((-90 + (i * 360) / Math.max(count, 1)) * Math.PI) / 180;
      const wobble = i % 2 === 0 ? 0 : 3;
      slots.push({
        x: 50 + (rx + wobble) * Math.cos(angle),
        y: 50 + (ry + wobble) * Math.sin(angle),
        rotation: 0,
      });
    }
    return slots;
  }

  peripherySlots(count: number): ConstellationSlot[] {
    const slots: ConstellationSlot[] = [];
    for (let i = 0; i < count; i++) {
      const angle = ((-54 + (i * 360) / Math.max(count, 1)) * Math.PI) / 180;
      slots.push({
        x: 50 + 45 * Math.cos(angle),
        y: 50 + 43 * Math.sin(angle),
        rotation: 0,
      });
    }
    return slots;
  }

  bubbleDiameter(years: number | undefined, maxYears: number): number {
    if (!years || maxYears <= 0) return this.DEFAULT_DIAMETER;
    const t = Math.min(years / maxYears, 1);
    return Math.round(this.MIN_DIAMETER + t * (this.MAX_DIAMETER - this.MIN_DIAMETER));
  }

  /** Offsets px des cartes preview floutées au survol d'une tile */
  previewOffsets(count: number): ConstellationSlot[] {
    const base: ConstellationSlot[] = [
      { x: -16, y: -38, rotation: -5 },
      { x: 34, y: -44, rotation: 3 },
      { x: 84, y: -30, rotation: 7 },
    ];
    return base.slice(0, Math.min(count, base.length));
  }
}
```

- [ ] **Step 4: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation-layout.service.spec.ts"`
Expected: PASS (12 specs).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/constellation/constellation-layout.service.ts src/app/shared/constellation/constellation-layout.service.spec.ts
git commit -m "feat(constellation): layout service pur (slots seedes, orbite, diametres)"
```

---

### Task 3: `ConstellationCardDirective` — marqueur de template projeté

**Files:**
- Create: `src/app/shared/constellation/constellation-card.directive.ts`
- Test: `src/app/shared/constellation/constellation-card.directive.spec.ts`

- [ ] **Step 1: Écrire le test (doit échouer)**

Créer `constellation-card.directive.spec.ts` :

```ts
import { Component, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConstellationCardDirective } from './constellation-card.directive';

@Component({
  standalone: true,
  imports: [ConstellationCardDirective],
  template: `
    <ng-template appConstellationCard="spotify">spotify</ng-template>
    <ng-template appConstellationCard="autre">autre</ng-template>
  `,
})
class HostComponent {
  readonly directives = viewChildren(ConstellationCardDirective);
}

describe('ConstellationCardDirective', () => {
  it('exposes its templateId and TemplateRef', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directives = fixture.componentInstance.directives();
    expect(directives.length).toBe(2);
    expect(directives[0].templateId).toBe('spotify');
    expect(directives[1].templateId).toBe('autre');
    expect(directives[0].template).toBeTruthy();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation-card.directive.spec.ts"`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter la directive**

Créer `constellation-card.directive.ts` :

```ts
import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appConstellationCard]',
  standalone: true,
})
export class ConstellationCardDirective {
  @Input({ alias: 'appConstellationCard', required: true }) templateId!: string;
  readonly template = inject(TemplateRef<unknown>);
}
```

- [ ] **Step 4: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation-card.directive.spec.ts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/constellation/constellation-card.directive.ts src/app/shared/constellation/constellation-card.directive.spec.ts
git commit -m "feat(constellation): directive de carte projetee"
```

---

### Task 4: `ConstellationComponent` — classe complète + état repos

La classe TS (machine à états, computed) est livrée entière ici ; le template ne rend
que l'état repos. Les états déployé/détail du template arrivent en Tasks 5-6.

**Files:**
- Create: `src/app/shared/constellation/constellation.component.ts`
- Create: `src/app/shared/constellation/constellation.component.html`
- Create: `src/app/shared/constellation/constellation.component.scss`
- Test: `src/app/shared/constellation/constellation.component.spec.ts`
- Modify: `src/assets/i18n/fr.json`, `src/assets/i18n/en.json` (clés `CONSTELLATION`)

- [ ] **Step 1: Écrire les tests de la machine à états et du rendu repos (doivent échouer)**

Créer `constellation.component.spec.ts` :

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ConstellationComponent } from './constellation.component';
import { ConstellationCardDirective } from './constellation-card.directive';
import { ConstellationCategory } from './constellation.types';

const CATS: ConstellationCategory[] = [
  {
    id: 'langages',
    label: 'Langages',
    cards: [
      { id: 'ts', title: 'TypeScript', years: 6, meta: '6 années', detail: 'niveau avancé', emphasis: 'high' },
      { id: 'php', title: 'PHP', years: 1, meta: '1 année', detail: 'bonnes bases', emphasis: 'low' },
      { id: 'sans-detail', title: 'Sans détail' },
    ],
  },
  {
    id: 'musique',
    label: 'Musique',
    cards: [{ id: 'spotify', title: 'Spotify', templateId: 'spotify' }],
  },
];

@Component({
  standalone: true,
  imports: [ConstellationComponent, ConstellationCardDirective],
  template: `
    <app-constellation [categories]="categories" seed="test">
      <ng-template appConstellationCard="spotify">
        <span class="custom-card">CUSTOM</span>
      </ng-template>
    </app-constellation>
  `,
})
class HostComponent {
  categories = CATS;
}

describe('ConstellationComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: ConstellationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(ConstellationComponent)
    ).componentInstance;
  });

  describe('state machine', () => {
    it('starts at rest', () => {
      expect(component.state().kind).toBe('rest');
    });

    it('openCategory moves to deployed', () => {
      component.openCategory('langages');
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
    });

    it('openDetail requires a deployed category and a detail', () => {
      component.openDetail(CATS[0].cards[0]);
      expect(component.state().kind).toBe('rest');
      component.openCategory('langages');
      component.openDetail(CATS[0].cards[2]); // sans détail → ignoré
      expect(component.state().kind).toBe('deployed');
      component.openDetail(CATS[0].cards[0]);
      expect(component.state()).toEqual({
        kind: 'detail',
        categoryId: 'langages',
        cardId: 'ts',
      });
    });

    it('back unwinds detail → deployed → rest, escape included', () => {
      component.openCategory('langages');
      component.openDetail(CATS[0].cards[0]);
      component.onEscape();
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
      component.back();
      expect(component.state().kind).toBe('rest');
      component.back(); // no-op au repos
      expect(component.state().kind).toBe('rest');
    });

    it('openCategory switches directly between categories', () => {
      component.openCategory('langages');
      component.openCategory('musique');
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'musique' });
    });
  });

  describe('rest rendering', () => {
    it('renders one tile button per category with its count', () => {
      const tiles = fixture.debugElement.queryAll(By.css('.tile'));
      expect(tiles.length).toBe(2);
      expect(tiles[0].nativeElement.textContent).toContain('Langages');
      expect(tiles[0].nativeElement.textContent).toContain('3');
    });

    it('renders preview ghosts (max 3) for each tile', () => {
      const groups = fixture.debugElement.queryAll(By.css('.tile-group'));
      expect(groups[0].queryAll(By.css('.preview-ghost')).length).toBe(3);
      expect(groups[1].queryAll(By.css('.preview-ghost')).length).toBe(1);
    });

    it('renders connecting lines between consecutive tiles', () => {
      expect(fixture.debugElement.queryAll(By.css('.lines line')).length).toBe(1);
    });

    it('clicking a tile deploys its category', () => {
      fixture.debugElement.queryAll(By.css('.tile'))[0].nativeElement.click();
      fixture.detectChanges();
      expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'langages' });
    });
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter la classe complète**

Créer `constellation.component.ts` :

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  ConstellationLayoutService,
  ConstellationSlot,
} from './constellation-layout.service';
import { ConstellationCardDirective } from './constellation-card.directive';
import {
  ConstellationCard,
  ConstellationCategory,
  ConstellationState,
} from './constellation.types';

@Component({
  selector: 'app-constellation',
  templateUrl: './constellation.component.html',
  styleUrl: './constellation.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgTemplateOutlet, TranslateModule],
})
export class ConstellationComponent {
  readonly categories = input.required<ConstellationCategory[]>();
  readonly seed = input<string>('constellation');

  private readonly layout = inject(ConstellationLayoutService);
  private readonly cardTemplates = contentChildren(ConstellationCardDirective);

  readonly state = signal<ConstellationState>({ kind: 'rest' });
  readonly isMobile = signal(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  readonly previewOffsets = computed(() => this.layout.previewOffsets(3));

  readonly restSlots = computed(() =>
    this.layout.restSlots(
      this.categories().length,
      this.seed(),
      this.isMobile() ? 'mobile' : 'desktop'
    )
  );

  readonly restLines = computed(() => {
    const slots = this.restSlots();
    return slots.slice(1).map((slot, i) => ({
      x1: slots[i].x,
      y1: slots[i].y,
      x2: slot.x,
      y2: slot.y,
    }));
  });

  readonly activeCategory = computed(() => {
    const s = this.state();
    if (s.kind === 'rest') return undefined;
    return this.categories().find((c) => c.id === s.categoryId);
  });

  readonly orbitSlots = computed(() => {
    const active = this.activeCategory();
    return active ? this.layout.orbitSlots(active.cards.length) : [];
  });

  readonly orbitLines = computed(() =>
    this.orbitSlots().map((slot) => ({ x1: 50, y1: 50, x2: slot.x, y2: slot.y }))
  );

  readonly peripherySlots = computed(() =>
    this.layout.peripherySlots(Math.max(this.categories().length - 1, 0))
  );

  readonly maxYears = computed(() => {
    const active = this.activeCategory();
    if (!active) return 0;
    return Math.max(...active.cards.map((c) => c.years ?? 0), 0);
  });

  readonly detailCard = computed(() => {
    const s = this.state();
    if (s.kind !== 'detail') return undefined;
    return this.activeCategory()?.cards.find((c) => c.id === s.cardId);
  });

  categorySlot(index: number): ConstellationSlot {
    const s = this.state();
    const cats = this.categories();
    if (s.kind === 'rest') return this.restSlots()[index];
    const activeIndex = cats.findIndex((c) => c.id === s.categoryId);
    if (index === activeIndex) return { x: 50, y: 50, rotation: 0 };
    const slotIndex = index < activeIndex ? index : index - 1;
    return this.peripherySlots()[slotIndex];
  }

  isActive(categoryId: string): boolean {
    const s = this.state();
    return s.kind !== 'rest' && s.categoryId === categoryId;
  }

  diameterOf(card: ConstellationCard): number {
    return this.layout.bubbleDiameter(card.years, this.maxYears());
  }

  templateFor(templateId: string | undefined) {
    if (!templateId) return null;
    return (
      this.cardTemplates().find((t) => t.templateId === templateId)?.template ?? null
    );
  }

  previewCards(category: ConstellationCategory): ConstellationCard[] {
    return category.cards.slice(0, 3);
  }

  openCategory(categoryId: string): void {
    this.state.set({ kind: 'deployed', categoryId });
  }

  openDetail(card: ConstellationCard): void {
    const s = this.state();
    if (s.kind === 'rest' || !card.detail) return;
    this.state.set({ kind: 'detail', categoryId: s.categoryId, cardId: card.id });
  }

  back(): void {
    const s = this.state();
    if (s.kind === 'detail') {
      this.state.set({ kind: 'deployed', categoryId: s.categoryId });
    } else if (s.kind === 'deployed') {
      this.state.set({ kind: 'rest' });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.back();
  }
}
```

- [ ] **Step 4: Créer le template (état repos uniquement)**

Créer `constellation.component.html` :

```html
<div
  class="constellation"
  [class.is-deployed]="state().kind !== 'rest'"
  [class.is-detail]="state().kind === 'detail'"
>
  <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    @if (state().kind === 'rest') {
      @for (line of restLines(); track $index) {
        <line
          [attr.x1]="line.x1" [attr.y1]="line.y1"
          [attr.x2]="line.x2" [attr.y2]="line.y2"
          vector-effect="non-scaling-stroke"
        />
      }
    }
  </svg>

  @for (category of categories(); track category.id; let i = $index) {
    <div
      class="tile-group"
      [class.is-active]="isActive(category.id)"
      [class.is-periphery]="state().kind !== 'rest' && !isActive(category.id)"
      [style.--x]="categorySlot(i).x"
      [style.--y]="categorySlot(i).y"
      [style.--rot]="categorySlot(i).rotation"
      [style.--float-delay]="i"
    >
      @if (state().kind === 'rest') {
        @for (preview of previewCards(category); track preview.id; let pi = $index) {
          <span
            class="preview-ghost"
            aria-hidden="true"
            [style.--px]="previewOffsets()[pi].x"
            [style.--py]="previewOffsets()[pi].y"
            [style.--prot]="previewOffsets()[pi].rotation"
          >{{ preview.title }}</span>
        }
      }
      <button
        class="tile"
        type="button"
        (click)="openCategory(category.id)"
        [disabled]="isActive(category.id)"
        [attr.aria-expanded]="isActive(category.id)"
      >
        <span class="tile-label">{{ category.label }}</span>
        <span class="tile-count">{{ category.cards.length }}</span>
      </button>
    </div>
  }
</div>
```

- [ ] **Step 5: Créer le SCSS structurel**

Créer `constellation.component.scss` :

```scss
.constellation {
  position: relative;
  container-type: size;
  height: clamp(480px, 72vh, 680px);
  width: 100%;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  line {
    stroke: var(--color-border);
    stroke-width: 1px;
    transition: opacity var(--transition-slow);
  }
}

// Positionnement : --x / --y en % du conteneur via unités container-query.
// Seul transform est animé (équivalent FLIP sans mesure JS).
.tile-group {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(
    calc(var(--x) * 1cqw - 50%),
    calc(var(--y) * 1cqh - 50%)
  );
  transition: transform 0.55s cubic-bezier(0.3, 0.8, 0.3, 1),
    opacity var(--transition-slow),
    filter var(--transition-slow);
}

.tile {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-primary);
  font-family: var(--font-main);
  font-size: var(--font-size-base);
  cursor: pointer;
  box-shadow: var(--glow-subtle);
  transform: rotate(calc(var(--rot) * 1deg));
  transition: transform var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  white-space: nowrap;
}

.tile-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
}

.tile-group:hover .tile,
.tile:focus-visible {
  transform: rotate(0deg) scale(1.06);
  border-color: var(--color-accent-primary);
  box-shadow: var(--glow-primary);
}

.preview-ghost {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-accent);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  filter: blur(2.5px);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease, transform 0.35s ease;
}

.tile-group:hover .preview-ghost {
  opacity: 0.55;
  transform: translate(calc(-50% + var(--px) * 1px), calc(-50% + var(--py) * 1px))
    rotate(calc(var(--prot) * 1deg));
}
```

- [ ] **Step 6: Ajouter les clés i18n**

Dans `src/assets/i18n/fr.json`, après le bloc `"SKILLS"` (même niveau), ajouter :

```json
"CONSTELLATION": {
  "BACK": "← retour",
  "CLOSE": "fermer"
},
```

Dans `src/assets/i18n/en.json`, au même endroit :

```json
"CONSTELLATION": {
  "BACK": "← back",
  "CLOSE": "close"
},
```

- [ ] **Step 7: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: PASS (9 specs).

- [ ] **Step 8: Commit**

```bash
git add src/app/shared/constellation/ src/assets/i18n/fr.json src/assets/i18n/en.json
git commit -m "feat(constellation): composant - machine a etats et etat repos"
```

---

### Task 5: État déployé — orbite de bulles, périphérie, retour, projection

**Files:**
- Modify: `src/app/shared/constellation/constellation.component.html`
- Modify: `src/app/shared/constellation/constellation.component.scss`
- Test: `src/app/shared/constellation/constellation.component.spec.ts`

- [ ] **Step 1: Ajouter les tests du rendu déployé (doivent échouer)**

Ajouter dans `constellation.component.spec.ts`, après le bloc `describe('rest rendering', …)` :

```ts
describe('deployed rendering', () => {
  beforeEach(() => {
    component.openCategory('langages');
    fixture.detectChanges();
  });

  it('renders one bubble per card of the active category', () => {
    expect(fixture.debugElement.queryAll(By.css('.bubble')).length).toBe(3);
  });

  it('sizes bubbles proportionally to years', () => {
    const bubbles = fixture.debugElement.queryAll(By.css('button.bubble'));
    const sizeOf = (el: { nativeElement: HTMLElement }) =>
      parseFloat(el.nativeElement.style.getPropertyValue('--size'));
    expect(sizeOf(bubbles[0])).toBeGreaterThan(sizeOf(bubbles[1])); // TS 6 ans > PHP 1 an
  });

  it('disables bubbles without detail', () => {
    const bubbles = fixture.debugElement.queryAll(By.css('button.bubble'));
    expect(bubbles[2].nativeElement.disabled).toBeTrue();
  });

  it('marks non-active categories as periphery, still clickable', () => {
    const periphery = fixture.debugElement.queryAll(By.css('.tile-group.is-periphery'));
    expect(periphery.length).toBe(1);
    periphery[0].query(By.css('.tile')).nativeElement.click();
    fixture.detectChanges();
    expect(component.state()).toEqual({ kind: 'deployed', categoryId: 'musique' });
  });

  it('back button returns to rest', () => {
    fixture.debugElement.query(By.css('.back')).nativeElement.click();
    fixture.detectChanges();
    expect(component.state().kind).toBe('rest');
    expect(fixture.debugElement.queryAll(By.css('.bubble')).length).toBe(0);
  });

  it('renders projected templates for templateId cards', () => {
    component.openCategory('musique');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.custom-card'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.custom-card')).nativeElement.textContent)
      .toBe('CUSTOM');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: FAIL — 6 nouveaux specs en échec (`.bubble` introuvable…), les 9 anciens passent.

- [ ] **Step 3: Compléter le template**

Dans `constellation.component.html` :

**(a)** Dans le `<svg class="lines">`, compléter le `@if` existant avec la branche orbitale :

```html
    @if (state().kind === 'rest') {
      @for (line of restLines(); track $index) {
        <line
          [attr.x1]="line.x1" [attr.y1]="line.y1"
          [attr.x2]="line.x2" [attr.y2]="line.y2"
          vector-effect="non-scaling-stroke"
        />
      }
    } @else {
      @for (line of orbitLines(); track $index) {
        <line
          [attr.x1]="line.x1" [attr.y1]="line.y1"
          [attr.x2]="line.x2" [attr.y2]="line.y2"
          vector-effect="non-scaling-stroke"
        />
      }
    }
```

**(b)** Après le `@for` des `tile-group` (avant le `</div>` final), ajouter :

```html
  @if (activeCategory(); as active) {
    @for (card of active.cards; track card.id; let ci = $index) {
      <div
        class="bubble-wrap"
        [style.--x]="orbitSlots()[ci].x"
        [style.--y]="orbitSlots()[ci].y"
        [style.--d]="ci"
      >
        @if (templateFor(card.templateId); as tpl) {
          <div class="bubble bubble--custom">
            <ng-container *ngTemplateOutlet="tpl"></ng-container>
          </div>
        } @else {
          <button
            class="bubble"
            type="button"
            [class.bubble--high]="card.emphasis === 'high'"
            [class.bubble--low]="card.emphasis === 'low'"
            [class.is-dimmed]="state().kind === 'detail' && detailCard()?.id !== card.id"
            [class.is-focused]="detailCard()?.id === card.id"
            [style.--size]="diameterOf(card)"
            [disabled]="!card.detail"
            (click)="openDetail(card)"
          >
            <span class="bubble-title">{{ card.title }}</span>
            @if (card.meta) {
              <span class="bubble-meta">{{ card.meta }}</span>
            }
          </button>
        }
      </div>
    }
    <button class="back" type="button" (click)="back()">
      {{ 'CONSTELLATION.BACK' | translate }}
    </button>
  }
```

- [ ] **Step 4: Compléter le SCSS**

Ajouter à la fin de `constellation.component.scss` :

```scss
.bubble-wrap {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(
    calc(var(--x) * 1cqw - 50%),
    calc(var(--y) * 1cqh - 50%)
  );
  animation: constellation-deal 0.6s cubic-bezier(0.18, 0.75, 0.25, 1) both;
  animation-delay: calc(var(--d) * 0.1s);
}

// `to` omis : l'animation retombe sur le transform calculé de l'élément
@keyframes constellation-deal {
  from {
    transform: translate(calc(50cqw - 50%), calc(50cqh - 50%)) scale(0.35);
    opacity: 0;
  }
}

.bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: calc(var(--size) * 1px);
  height: calc(var(--size) * 1px);
  border-radius: 50%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-accent);
  color: var(--color-text-primary);
  font-family: var(--font-main);
  cursor: pointer;
  box-shadow: var(--glow-subtle);
  text-align: center;
  padding: var(--space-2);
  transition: opacity var(--transition-base), filter var(--transition-base),
    border-color var(--transition-base), box-shadow var(--transition-base);

  &:disabled {
    cursor: default;
  }

  &:not(:disabled):hover,
  &:focus-visible {
    border-color: var(--color-accent-primary);
    box-shadow: var(--glow-primary);
  }
}

.bubble--high {
  border-color: var(--color-accent-primary);
  box-shadow: var(--glow-secondary);
}

.bubble--low {
  border-color: var(--color-border);
}

.bubble--custom {
  width: auto;
  height: auto;
  border-radius: var(--border-radius-lg);
  padding: 0;
  overflow: hidden;
}

.bubble-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  max-width: 92%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bubble-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.is-dimmed {
  opacity: 0.35;
  filter: blur(1px);
}

.is-periphery {
  filter: blur(2.5px);
  opacity: 0.45;
  z-index: 1;

  &:hover {
    filter: blur(0.5px);
    opacity: 0.8;
  }

  .preview-ghost {
    display: none;
  }
}

.tile-group.is-active {
  z-index: 3;

  .tile {
    background: var(--color-bg-elevated);
    border-color: var(--color-accent-primary);
    box-shadow: var(--glow-primary);
    cursor: default;
    transform: rotate(0deg);
  }
}

.back {
  position: absolute;
  left: var(--space-5);
  bottom: var(--space-5);
  z-index: 4;
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-accent);
  font-family: var(--font-main);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--transition-base);

  &:hover,
  &:focus-visible {
    border-color: var(--color-accent-primary);
  }
}
```

- [ ] **Step 5: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: PASS (15 specs).

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/constellation/
git commit -m "feat(constellation): etat deploye - orbite, peripherie, retour, projection"
```

---

### Task 6: État détail — panneau, estompage, fermeture

**Files:**
- Modify: `src/app/shared/constellation/constellation.component.html`
- Modify: `src/app/shared/constellation/constellation.component.scss`
- Test: `src/app/shared/constellation/constellation.component.spec.ts`

- [ ] **Step 1: Ajouter les tests du panneau détail (doivent échouer)**

Ajouter dans `constellation.component.spec.ts`, après `describe('deployed rendering', …)` :

```ts
describe('detail rendering', () => {
  beforeEach(() => {
    component.openCategory('langages');
    fixture.detectChanges();
    fixture.debugElement.queryAll(By.css('button.bubble'))[0].nativeElement.click();
    fixture.detectChanges();
  });

  it('opens the detail panel with title, meta and detail text', () => {
    const panel = fixture.debugElement.query(By.css('.detail-panel'));
    expect(panel).toBeTruthy();
    expect(panel.nativeElement.textContent).toContain('TypeScript');
    expect(panel.nativeElement.textContent).toContain('6 années');
    expect(panel.nativeElement.textContent).toContain('niveau avancé');
  });

  it('dims the other bubbles', () => {
    const dimmed = fixture.debugElement.queryAll(By.css('.bubble.is-dimmed'));
    expect(dimmed.length).toBe(2);
  });

  it('closes on backdrop click', () => {
    fixture.debugElement.query(By.css('.detail-backdrop')).nativeElement.click();
    fixture.detectChanges();
    expect(component.state().kind).toBe('deployed');
    expect(fixture.debugElement.query(By.css('.detail-panel'))).toBeNull();
  });

  it('closes via the close button', () => {
    fixture.debugElement.query(By.css('.detail-close')).nativeElement.click();
    fixture.detectChanges();
    expect(component.state().kind).toBe('deployed');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: FAIL — 4 nouveaux specs en échec.

- [ ] **Step 3: Compléter le template**

Dans `constellation.component.html`, juste avant le `</div>` final (après le bloc `@if (activeCategory(); …)`), ajouter :

```html
  @if (detailCard(); as card) {
    <div class="detail-backdrop" (click)="back()" aria-hidden="true"></div>
    <aside class="detail-panel" role="dialog" [attr.aria-label]="card.title">
      <h3 class="detail-title">{{ card.title }}</h3>
      @if (card.meta) {
        <p class="detail-meta">{{ card.meta }}</p>
      }
      @if (card.detail) {
        <p class="detail-text">{{ card.detail }}</p>
      }
      @if (card.tags?.length) {
        <div class="detail-tags">
          @for (tag of card.tags; track tag) {
            <span class="detail-tag">{{ tag }}</span>
          }
        </div>
      }
      <button class="detail-close" type="button" (click)="back()">
        {{ 'CONSTELLATION.CLOSE' | translate }}
      </button>
    </aside>
  }
```

- [ ] **Step 4: Compléter le SCSS**

Ajouter à la fin de `constellation.component.scss` :

```scss
.detail-backdrop {
  position: absolute;
  inset: 0;
  z-index: 4;
}

.detail-panel {
  position: absolute;
  right: var(--space-5);
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 260px;
  padding: var(--space-5);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-accent);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--glow-primary);
  animation: detail-in 0.25s ease both;
}

@keyframes detail-in {
  from {
    opacity: 0;
    transform: translateY(calc(-50% + 12px));
  }
}

.detail-title {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-lg);
  color: var(--color-text-accent);
}

.detail-meta {
  margin: 0 0 var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-text {
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
  color: var(--color-text-primary);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.detail-tag {
  padding: 2px var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-accent);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  color: var(--color-text-accent);
}

.detail-close {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: var(--color-accent-primary);
    color: var(--color-text-accent);
  }
}
```

- [ ] **Step 5: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation.component.spec.ts"`
Expected: PASS (19 specs).

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/constellation/
git commit -m "feat(constellation): etat detail - panneau, estompage, fermeture"
```

---

### Task 7: Vie & adaptation — float, reduced-motion, mobile

Pas de test unitaire (rendu purement visuel) ; la vérification est le build + les tests existants qui ne régressent pas.

**Files:**
- Modify: `src/app/shared/constellation/constellation.component.scss`
- Modify: `src/app/shared/constellation/constellation.component.html` (structure du float)

- [ ] **Step 1: Isoler le float du positionnement**

L'animation de flottement et le `transform` de positionnement ne peuvent pas vivre sur le même élément (l'animation écraserait le positionnement). Dans `constellation.component.html`, envelopper le contenu de chaque `tile-group` dans un `div.tile-float` :

```html
    <div
      class="tile-group"
      [class.is-active]="isActive(category.id)"
      [class.is-periphery]="state().kind !== 'rest' && !isActive(category.id)"
      [style.--x]="categorySlot(i).x"
      [style.--y]="categorySlot(i).y"
      [style.--rot]="categorySlot(i).rotation"
      [style.--float-delay]="i"
    >
      <div class="tile-float">
        @if (state().kind === 'rest') {
          @for (preview of previewCards(category); track preview.id; let pi = $index) {
            <span
              class="preview-ghost"
              aria-hidden="true"
              [style.--px]="previewOffsets()[pi].x"
              [style.--py]="previewOffsets()[pi].y"
              [style.--prot]="previewOffsets()[pi].rotation"
            >{{ preview.title }}</span>
          }
        }
        <button
          class="tile"
          type="button"
          (click)="openCategory(category.id)"
          [disabled]="isActive(category.id)"
          [attr.aria-expanded]="isActive(category.id)"
        >
          <span class="tile-label">{{ category.label }}</span>
          <span class="tile-count">{{ category.cards.length }}</span>
        </button>
      </div>
    </div>
```

- [ ] **Step 2: Ajouter float, reduced-motion et mobile au SCSS**

Ajouter à la fin de `constellation.component.scss` :

```scss
.tile-float {
  position: relative;
  animation: constellation-float 5.5s ease-in-out infinite;
  animation-delay: calc(var(--float-delay) * -1.3s);
}

@keyframes constellation-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

// le float s'arrête quand la constellation est déployée
.is-deployed .tile-float {
  animation: none;
}

@media (max-width: 768px) {
  .constellation {
    height: max(560px, 78vh);
  }

  .tile {
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-3);
  }

  .preview-ghost {
    display: none; // pas de hover sur tactile
  }

  .back {
    left: 50%;
    transform: translateX(-50%);
  }

  .detail-backdrop {
    position: fixed;
    background: rgba(0, 0, 0, 0.35);
  }

  .detail-panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    transform: none;
    width: auto;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    animation: detail-up 0.25s ease both;
  }

  @keyframes detail-up {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile-float {
    animation: none;
  }

  .bubble-wrap {
    animation-duration: 0.01s;
    animation-delay: 0s;
  }

  .tile-group,
  .bubble-wrap,
  .preview-ghost {
    transition-duration: 0.01s;
  }
}
```

- [ ] **Step 3: Vérifier que rien ne régresse**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/constellation*.spec.ts"`
Expected: PASS (les 19 specs composant + service + directive).

Run: `npx ng build`
Expected: succès sans erreur.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/constellation/
git commit -m "feat(constellation): float, prefers-reduced-motion et layout mobile"
```

---

### Task 8: Adaptateur Skills

**Files:**
- Modify: `src/app/skills/skills.component.ts` (réécriture)
- Modify: `src/app/skills/skills.component.html` (réécriture)
- Modify: `src/app/skills/skills.component.scss` (purge des styles morts)
- Modify: `src/app/skills/skills.component.spec.ts` (réécriture — l'ancien spec utilise `declarations`, obsolète pour un standalone)

- [ ] **Step 1: Réécrire le spec (doit échouer)**

Remplacer intégralement `src/app/skills/skills.component.spec.ts` :

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SkillsComponent } from './skills.component';
import { GetJsonService } from '../services/get-json.service';
import { SkillCategory } from 'src/assets/data/contentInterface';

const MOCK_SKILLS: SkillCategory[] = [
  {
    name: 'Langages de programmation & scripting',
    skills: [
      {
        lang: 'TypeScript (& JavaScript)',
        time: '6 années',
        level: 'projets professionnels & personnels : niveau avancé',
        years: 6,
        levelKey: 'advanced',
      },
      {
        lang: 'PHP',
        time: '1 année',
        level: 'projets professionnels : bonnes bases',
        years: 1,
        levelKey: 'beginner',
      },
    ],
  },
];

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: GetJsonService,
          useValue: {
            getSkills: () => of(MOCK_SKILLS),
            getSoftSkills: () => of(['Autonomie', 'Rigueur']),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps skill categories plus a soft-skills category', () => {
    expect(component.categories.length).toBe(2);
    expect(component.categories[0].id).toBe('langages-de-programmation-scripting');
    expect(component.categories[1].id).toBe('soft-skills');
  });

  it('maps skills to cards with years, meta, detail and emphasis', () => {
    const ts = component.categories[0].cards[0];
    expect(ts.title).toBe('TypeScript (& JavaScript)');
    expect(ts.years).toBe(6);
    expect(ts.meta).toBe('6 années');
    expect(ts.detail).toContain('niveau avancé');
    expect(ts.emphasis).toBe('high');
    expect(component.categories[0].cards[1].emphasis).toBe('low');
  });

  it('soft skill cards have no years and no detail', () => {
    const soft = component.categories[1].cards[0];
    expect(soft.years).toBeUndefined();
    expect(soft.detail).toBeUndefined();
  });

  it('renders the constellation', () => {
    expect(fixture.debugElement.query(By.css('app-constellation'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.tile')).length).toBe(2);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/skills.component.spec.ts"`
Expected: FAIL — `categories` n'existe pas sur `SkillsComponent`.

- [ ] **Step 3: Réécrire le composant**

Remplacer intégralement `src/app/skills/skills.component.ts` :

```ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Skill, SkillCategory } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { ConstellationComponent } from '../shared/constellation/constellation.component';
import {
  ConstellationCard,
  ConstellationCategory,
} from '../shared/constellation/constellation.types';
import { slugify } from '../shared/constellation/constellation-layout.service';

const EMPHASIS: Record<Skill['levelKey'], ConstellationCard['emphasis']> = {
  advanced: 'high',
  intermediate: 'medium',
  beginner: 'low',
};

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective, ConstellationComponent],
})
export class SkillsComponent implements OnInit, OnDestroy {
  categories: ConstellationCategory[] = [];
  private readonly json = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getSkills(),
      this.json.getSoftSkills(),
      this.translate.stream('SKILLS.SOFT'),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([skillCategories, softs, softLabel]) => {
        this.categories = this.toCategories(skillCategories, softs, softLabel);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toCategories(
    skillCategories: SkillCategory[],
    softs: string[],
    softLabel: string
  ): ConstellationCategory[] {
    const categories: ConstellationCategory[] = skillCategories.map((category) => ({
      id: slugify(category.name),
      label: category.name,
      cards: category.skills.map((skill) => ({
        id: slugify(skill.lang),
        title: skill.lang,
        years: skill.years,
        meta: skill.time,
        detail: skill.level,
        tags: [],
        emphasis: EMPHASIS[skill.levelKey],
      })),
    }));
    categories.push({
      id: 'soft-skills',
      label: softLabel,
      cards: softs.map((soft) => ({ id: slugify(soft), title: soft })),
    });
    return categories;
  }
}
```

Remplacer intégralement `src/app/skills/skills.component.html` :

```html
<!-- src/app/skills/skills.component.html -->
<div class="page-container">

  <div class="section-header" appScrollReveal="reveal">
    <p class="section-overline">{{ 'SKILLS.OVERLINE' | translate }}</p>
    <h2>{{ 'SKILLS.TECH' | translate }}</h2>
  </div>

  <app-constellation [categories]="categories" seed="skills"></app-constellation>

</div>
```

- [ ] **Step 4: Purger le SCSS**

Dans `src/app/skills/skills.component.scss`, supprimer tous les blocs ciblant des classes
absentes du nouveau template : `.skill-directory`, `.directory-header`, `.dir-name`,
`.dir-count`, `.skill-tags`, `.skill-tag`, `.tag-name`, `.tag-meta`, `.tag-level`,
`.soft-tags`, `.soft-tag`, `.section-header--soft` et tout sélecteur `[data-level]`.
Conserver `.page-container`, `.section-header`, `.section-overline` et les styles de `h2`.

- [ ] **Step 5: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/skills.component.spec.ts"`
Expected: PASS (5 specs).

- [ ] **Step 6: Commit**

```bash
git add src/app/skills/
git commit -m "feat(skills): la page skills passe en navigation constellation"
```

---

### Task 9: Adaptateur Passions (+ carte Spotify projetée)

**Files:**
- Modify: `src/app/passions/passions.component.ts` (réécriture)
- Modify: `src/app/passions/passions.component.html` (réécriture)
- Modify: `src/app/passions/passions.component.scss` (purge des styles morts)
- Modify: `src/app/passions/passions.component.spec.ts` (réécriture)
- Modify: `src/assets/i18n/fr.json`, `src/assets/i18n/en.json` (clés `PASSIONS.OVERLINE`/`TITLE`)

- [ ] **Step 1: Ajouter les clés i18n**

Dans `src/assets/i18n/fr.json`, au début du bloc `"PASSIONS"` :

```json
"OVERLINE": "Passions",
"TITLE": "Ce qui m'anime",
```

Dans `src/assets/i18n/en.json`, au même endroit :

```json
"OVERLINE": "Passions",
"TITLE": "What drives me",
```

- [ ] **Step 2: Réécrire le spec (doit échouer)**

Remplacer intégralement `src/app/passions/passions.component.spec.ts` :

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PassionsComponent } from './passions.component';
import { GetJsonService } from '../services/get-json.service';
import { Passion } from 'src/assets/data/contentInterface';

const MOCK_PASSIONS: Passion[] = [
  { name: 'Handball', type: 'sport' },
  { name: 'Ski', type: 'sport' },
  { name: 'Espace', type: 'other' },
];

describe('PassionsComponent', () => {
  let component: PassionsComponent;
  let fixture: ComponentFixture<PassionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassionsComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        {
          provide: GetJsonService,
          useValue: { getPassions: () => of(MOCK_PASSIONS) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds sports, others and music categories', () => {
    expect(component.categories.map((c) => c.id)).toEqual(['sports', 'autres', 'musique']);
    expect(component.categories[0].cards.length).toBe(2);
    expect(component.categories[1].cards.length).toBe(1);
  });

  it('music category holds a single spotify template card', () => {
    const music = component.categories[2];
    expect(music.cards.length).toBe(1);
    expect(music.cards[0].templateId).toBe('spotify');
  });

  it('renders the constellation with 3 tiles', () => {
    expect(fixture.debugElement.queryAll(By.css('.tile')).length).toBe(3);
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/passions.component.spec.ts"`
Expected: FAIL — `categories` n'existe pas sur `PassionsComponent`.

- [ ] **Step 4: Réécrire le composant**

Remplacer intégralement `src/app/passions/passions.component.ts` :

```ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';
import { SpotifyWidgetComponent } from '../shared/spotify-widget/spotify-widget.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Passion } from 'src/assets/data/contentInterface';
import { GetJsonService } from '../services/get-json.service';
import { ConstellationComponent } from '../shared/constellation/constellation.component';
import { ConstellationCardDirective } from '../shared/constellation/constellation-card.directive';
import { ConstellationCategory } from '../shared/constellation/constellation.types';
import { slugify } from '../shared/constellation/constellation-layout.service';

const LABEL_KEYS = [
  'PASSIONS.SPORTS',
  'PASSIONS.OTHERS',
  'PASSIONS.SPOTIFY_OVERLINE',
  'PASSIONS.SPOTIFY_TITLE',
] as const;

@Component({
  selector: 'app-passions',
  templateUrl: './passions.component.html',
  styleUrl: './passions.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ScrollRevealDirective,
    SpotifyWidgetComponent,
    ConstellationComponent,
    ConstellationCardDirective,
  ],
})
export class PassionsComponent implements OnInit, OnDestroy {
  categories: ConstellationCategory[] = [];
  private readonly json = inject(GetJsonService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([
      this.json.getPassions(),
      this.translate.stream([...LABEL_KEYS]),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([passions, labels]) => {
        this.categories = this.toCategories(passions, labels);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toCategories(
    passions: Passion[],
    labels: Record<string, string>
  ): ConstellationCategory[] {
    const sports = passions.filter((p) => p.type === 'sport');
    const others = passions.filter((p) => p.type !== 'sport');
    return [
      {
        id: 'sports',
        label: labels['PASSIONS.SPORTS'],
        cards: sports.map((p) => ({ id: slugify(p.name), title: p.name })),
      },
      {
        id: 'autres',
        label: labels['PASSIONS.OTHERS'],
        cards: others.map((p) => ({ id: slugify(p.name), title: p.name })),
      },
      {
        id: 'musique',
        label: labels['PASSIONS.SPOTIFY_OVERLINE'],
        cards: [
          {
            id: 'spotify',
            title: labels['PASSIONS.SPOTIFY_TITLE'],
            templateId: 'spotify',
          },
        ],
      },
    ];
  }
}
```

Remplacer intégralement `src/app/passions/passions.component.html` :

```html
<!-- src/app/passions/passions.component.html -->
<div class="page-container">

  <div class="section-header" appScrollReveal="reveal">
    <p class="section-overline">{{ 'PASSIONS.OVERLINE' | translate }}</p>
    <h2>{{ 'PASSIONS.TITLE' | translate }}</h2>
  </div>

  <app-constellation [categories]="categories" seed="passions">
    <ng-template appConstellationCard="spotify">
      <app-spotify-widget></app-spotify-widget>
    </ng-template>
  </app-constellation>

</div>
```

- [ ] **Step 5: Purger le SCSS**

Dans `src/app/passions/passions.component.scss`, supprimer les blocs ciblant
`.passion-grid`, `.passion-tile`, `.passion-glyph`, `.passion-name`,
`.section-header--other`. Conserver `.page-container`, `.section-header`,
`.section-overline` et les styles de `h2`.

- [ ] **Step 6: Vérifier le passage**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include="**/passions.component.spec.ts"`
Expected: PASS (4 specs).

- [ ] **Step 7: Commit**

```bash
git add src/app/passions/ src/assets/i18n/fr.json src/assets/i18n/en.json
git commit -m "feat(passions): la page passions passe en constellation avec carte spotify"
```

---

### Task 10: Vérification finale

**Files:** aucun nouveau — vérifications globales.

- [ ] **Step 1: Suite de tests complète**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — toutes les suites (constellation, skills, passions, spotify, données, app…). Si d'anciens specs échouent pour des raisons indépendantes de cette feature, le signaler sans les « réparer » à l'aveugle.

- [ ] **Step 2: Build de production**

Run: `npx ng build`
Expected: succès, pas d'erreur de budget CSS (sinon ajuster `angular.json` n'est PAS la solution : réduire le SCSS).

- [ ] **Step 3: Vérification visuelle manuelle**

Run: `npm start`, ouvrir `http://localhost:4200`, vérifier :
- `/skills` : 6 tiles flottantes reliées, hover → preview floutée, clic → distribution orbitale (TypeScript nettement plus gros que PHP), clic bulle → panneau détail, Échap × 2 → retour au repos
- `/passions` : 3 tiles ; « Musique » déployée → le widget Spotify fonctionne (lecture embed)
- Bascule fr/en : labels et catégories suivent la langue
- Thème clair : lisibilité des bulles et traits
- Fenêtre étroite (~400px) : layout mobile vertical, panneau détail en bottom-sheet

- [ ] **Step 4: Commit final éventuel**

Si la vérification manuelle a demandé des micro-retouches CSS :

```bash
git add -A
git commit -m "polish(constellation): retouches visuelles post-verification"
```

---

## Couverture spec → tasks

| Exigence spec | Task |
|---|---|
| Types + `years`/`levelKey` | 1 |
| Layout service pur (slots seedés, orbite, diamètres bornés, previews) | 2 |
| Projection de cartes custom (Spotify) | 3, 5, 9 |
| État repos constellation + traits + hover preview | 4 |
| État déployé orbital, périphérie floutée cliquable, retour | 5 |
| Panneau détail + estompage + Échap/clic ailleurs | 6 |
| Float, `prefers-reduced-motion`, mobile (bottom-sheet, tap direct) | 7 |
| Adaptateur Skills + soft skills 6e catégorie + suppression `getLevelClass` | 8 |
| Adaptateur Passions 3 catégories | 9 |
| Accessibilité clavier (boutons natifs, Échap, aria) | 4-6 |
| Aucune dépendance npm | toutes |
