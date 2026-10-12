# Skill Linking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One language-neutral skill registry referenced by every experience (pro, internships, side projects, education); a shared card + timeline design across Work exp / Side projects / Education; an interactive Skills page where selecting skills opens a side panel listing the experiences that used all of them.

**Architecture:** `skills.ts` exports a typed `SKILLS` registry (`SkillId = keyof typeof SKILLS`). Experiences in `content.ts` gain `id`, ISO dates, `icon` and `skills: SkillId[]`. Two shared standalone components — `ExperienceCardComponent` (`full` / `compact`) and `TimelineComponent` (zig-zag, extracted from `projects.component`) — render every experience page. Selection is a pure function (`skill-selection.ts`) driving a `SkillPanelComponent`. `magnetic-scroll` is deleted once unused.

**Tech Stack:** Angular 21 (standalone, signals), ngx-translate, Karma + Jasmine.

**Spec:** `docs/superpowers/specs/2026-10-12-skill-linking-design.md`

**Baseline:** 6 pre-existing failing specs on master (unrelated). Each task must keep that number at 6 and add only passing specs.

---

## File Structure

- **Create** `src/assets/data/skills.ts` — registry, `SkillId`, `SkillLevel`, `SkillCategoryId`, category order.
- **Modify** `src/assets/data/contentInterface.ts` — `ExperienceBase`; `Experience`, `Education`, `Project` extend it; drop `skillCategories`, `Skill`, `SkillCategory`, `MagneticScroll*`.
- **Modify** `src/assets/data/content.ts` — ids, ISO dates, icons, `skills` on every item (FR + EN); remove `skillCategories`.
- **Create** `src/assets/data/content.spec.ts` — FR/EN parity (ids, dates, skills, icons, links) + every skill id resolves.
- **Create** `src/app/shared/experience-card/experience-card.component.{ts,html,scss,spec.ts}`
- **Create** `src/app/shared/timeline/timeline.component.{ts,html,scss,spec.ts}`
- **Create** `src/app/skills/skill-selection.ts` + `skill-selection.spec.ts` — pure selection logic.
- **Create** `src/app/skills/skill-panel/skill-panel.component.{ts,html,scss}`
- **Create** `src/app/services/skills.service.ts` — localized skill view-models + "used in" index.
- **Modify** `src/app/skills/*`, `src/app/projects/*`, `src/app/experiences/*`, `src/app/education/*`.
- **Modify** `src/assets/i18n/{fr,en}.json` — categories, levels, years, period/duration, panel strings.
- **Delete** `src/app/shared/magnetic-scroll/` (component + spec).
- **Modify** `docs/ROADMAP.md` — features 3 & 4 build on the registry.

---

## Task 1: Skill registry + Skills page migration (no interaction yet)

**Files:** `skills.ts`, `contentInterface.ts`, `content.ts`, `skills.service.ts`, `skills.component.*`, i18n.

- [x] Create `skills.ts`:

```ts
export type SkillLevel = 'advanced' | 'intermediate' | 'good' | 'basics' | 'beginner';
export type SkillCategoryId = 'languages' | 'frameworks' | 'data' | 'devops' | 'practices' | 'ai';
type Label = string | { fr: string; en: string };

export interface SkillDef { category: SkillCategoryId; label: Label; years: number; level: SkillLevel; }

export const SKILL_CATEGORIES: SkillCategoryId[] = ['languages', 'frameworks', 'data', 'devops', 'practices', 'ai'];

export const SKILLS = {
  typescript: { category: 'languages', label: 'TypeScript (& JavaScript)', years: 6, level: 'advanced' },
  // … one entry per current skill + PostgreSQL, Prisma, Supabase, NestJS, Tailwind CSS
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;
```

  Levels map from today's strings: « niveau avancé » → `advanced`, « bon niveau » → `good`, « niveau intermédiaire » → `intermediate`, « bonnes bases » → `basics`, « débutant » → `beginner`.
- [x] `SkillsService.getSkillCategories()` returns `{ id, name, skills: { id, label, years, level, context } [] }[]` for the current language. `context` = `'pro' | 'perso' | 'both' | null`, derived from which experiences tag the skill (pro + internships = pro, projects = perso).
- [x] i18n: `SKILLS.CATEGORY.*`, `SKILLS.LEVEL.*`, `SKILLS.YEARS` (`{{count}} année(s)` / `{{count}} year(s)`), `SKILLS.CONTEXT.*` — rebuilds « projets professionnels & personnels : niveau avancé ».
- [x] Skills page reads from the service; `getLevelClass` deleted (level is an enum now).
- [x] Remove `skillCategories` from `content.ts` and `CVDataContent`; remove `getSkills()` from `GetJsonService`.
- [x] Verify: `ng build`; screenshot `/skills` FR + EN — same content as before except the new skills and the new "Bases de données" category.
- [x] Commit `feat(skills): language-neutral skill registry`.

## Task 2: Shared experience model + data

**Files:** `contentInterface.ts`, `content.ts`, `content.spec.ts`.

- [x] `ExperienceBase { id; icon?; dateFrom; dateTo?; skills: SkillId[] }`. `Experience` (pro/internship: `title, company, location, descriptions`), `Education` (`title, school, location, descriptions`), `Project` (`name, kind, status, summary, links, updatedAt`; `createdAt` → `dateFrom`, `tags` → `skills`).
- [x] Fill every item FR + EN from the spec's table (§5) with the confirmed tags; icons from `assets/pictures/experiences/` (normalized PNG/SVG).
- [x] `content.spec.ts`: for each collection, FR and EN have the same `id`s in the same order with identical `dateFrom`, `dateTo`, `skills`, `icon`, `links`.
- [x] Verify: `ng build` (type errors catch unknown skill ids), `ng test` → new spec green, still 6 baseline failures.
- [x] Commit `feat(data): shared experience model with skill tags`.

## Task 3: `ExperienceCardComponent` + `TimelineComponent`, migrate Side projects

**Files:** `shared/experience-card/*`, `shared/timeline/*`, `projects/*`.

- [x] `ExperienceCardComponent` inputs: `icon`, `title`, `subtitle?`, `status?`, `summary?`, `bullets?`, `skills: SkillId[]`, `links?`, `variant: 'full' | 'compact'`, `highlight: SkillId[]`. Logo tile: white background, 36 px high, auto width ≤ 120 px, `object-fit: contain`; initial-letter fallback when no icon. `full`: bullets beyond 4 collapsed behind « Voir plus / Show more ». `compact`: no summary/bullets, adds the period line.
- [x] Skill tags render the registry label; tags in `highlight` get the accent style.
- [x] `TimelineComponent`: input `entries: { id, meta: { label, value }[], … }[]`, content projection via `ng-template` for the card; zig-zag + mobile layout moved verbatim from `projects.component.scss`. Each row gets `[id]="entry.id"` (anchor target).
- [x] Migrate `projects.component` onto both components; GitHub last-push logic stays in the page.
- [x] Verify: screenshots `/projects` desktop + 520 px — identical to production except the logo tile.
- [x] Commit `refactor(projects): extract experience card and timeline`.

## Task 4: Migrate Work exp + Education, delete magnetic-scroll

**Files:** `experiences/*`, `education/*`, `shared/magnetic-scroll/` (delete), `contentInterface.ts`.

- [x] Experiences: two section headers (Expériences pro, Stages), one timeline each. Meta column: period (`Intl` « oct. 2024 → Aujourd'hui ») + duration (« 2 ans 1 mois »), helpers in `shared/timeline/format.ts` with unit tests (present-day, < 1 month, exact years).
- [x] Education: one timeline, same meta.
- [x] Delete `magnetic-scroll` + `MagneticScroll*` interfaces; grep for leftovers (`ms-`, `MagneticScroll`).
- [x] Verify: build, tests, screenshots `/experiences` and `/education` desktop + 520 px, FR + EN, light + dark (logo tiles readable).
- [x] Commit `refactor(experiences,education): timeline layout, drop magnetic-scroll`.

## Task 5: Selection logic

**Files:** `skills/skill-selection.ts`, `skills/skill-selection.spec.ts`.

- [x] Pure functions over `items: { id, skills: SkillId[] }[]`:

```ts
export function matching(items, selected: SkillId[]) // items using every selected skill
export function selectable(items, selected): Set<SkillId> // all skills if selected empty, else skills of matching()
export function toggle(items, selected, clicked): SkillId[]
  // selected → remove; selectable → add; greyed → [clicked]
```

- [x] Specs mirror the spec's table: empty start, add, remove, reset on greyed, remove-last → empty, skill used nowhere → `[clicked]` with empty `matching`, results never empty after successive adds.
- [x] Commit `feat(skills): pure skill selection logic`.

## Task 6: Interactive Skills page + side panel

**Files:** `skills/*`, `skills/skill-panel/*`, i18n.

- [x] Skill tags become `<button>`s with `aria-pressed`; greyed state = reduced opacity + desaturated, still clickable. Selection held in a signal; `matching` / `selectable` are `computed`.
- [x] `SkillPanelComponent`: header with selected chips + ✕; groups « Professionnel » (pro + internships) then « Personnel », each sorted by `dateFrom` desc; compact cards with `highlight = selected`. Empty state: « Pas encore d'expérience associée ».
- [x] Desktop: fixed right panel ~380 px, page content gets matching right padding. ≤ 768 px: bottom sheet, 60 vh, internal scroll. Slide transition disabled under `prefers-reduced-motion`. `Esc` closes.
- [x] Card click → `router.navigate([page], { fragment: id })`; enable `withInMemoryScrolling({ anchorScrolling: 'enabled' })` in `main.ts`; target card gets a short highlight class.
- [x] Verify: screenshots with 0 / 1 / 2 skills selected, desktop + 520 px; manual checks of the five selection rules in the browser; build + tests.
- [x] Commit `feat(skills): interactive skill selection with side panel`.

## Task 7: Wrap-up

- [x] ROADMAP: features 3 (GitHub tags) and 4 (card distribution) now build on `SKILLS`; note the skill linking as shipped.
- [x] Full pass FR/EN × light/dark × desktop/mobile on all four pages.
- [x] Open PR `feat/skill-linking` → `master`.
