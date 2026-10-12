import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { content } from 'src/assets/data/content';
import { CVDataContent } from 'src/assets/data/contentInterface';
import { localize, SKILL_CATEGORIES, SkillCategoryId, SkillDef, SkillId, SkillLevel, SKILLS } from 'src/assets/data/skills';
import { GetJsonService } from './get-json.service';
import { LanguageService, SupportedLanguage } from './language.service';

export type SkillContext = 'pro' | 'perso' | 'both';

export interface SkillView {
  id: SkillId;
  label: string;
  years: number;
  level: SkillLevel;
  context: SkillContext | null;
  note?: string;
}

export interface SkillCategoryView {
  id: SkillCategoryId;
  skills: SkillView[];
}

/** An experience the skill selection can point to. */
export interface LinkedItem {
  id: string;
  group: 'pro' | 'perso';
  route: '/experiences' | '/projects';
  icon?: string;
  iconFill?: boolean;
  iconDark?: 'invert' | 'plate';
  title: string;
  subtitle?: string;
  dateFrom: string;
  dateTo?: string;
  skills: SkillId[];
}

const SKILL_IDS = Object.keys(SKILLS) as SkillId[];

export function skillDef(id: SkillId): SkillDef {
  return SKILLS[id];
}

export function skillLabel(id: SkillId, lang: SupportedLanguage, short = false): string {
  const def: SkillDef = SKILLS[id];
  return short && def.short ? def.short : localize(def.label, lang);
}

export function linkedItems(data: CVDataContent): LinkedItem[] {
  const pro = [...(data.experiences?.pro ?? []), ...(data.experiences?.stage ?? [])].map((e): LinkedItem => ({
    id: e.id, group: 'pro', route: '/experiences', icon: e.icon, iconFill: e.iconFill, iconDark: e.iconDark,
    title: e.title, subtitle: e.company, dateFrom: e.dateFrom, dateTo: e.dateTo, skills: e.skills,
  }));
  const perso = (data.projects ?? []).map((p): LinkedItem => ({
    id: p.id, group: 'perso', route: '/projects', icon: p.icon, iconFill: p.iconFill, iconDark: p.iconDark,
    title: p.name, dateFrom: p.dateFrom, skills: p.skills,
  }));
  return [...pro, ...perso];
}

// Tags are identical in every language (enforced by content.spec), so derive once.
function deriveContexts(items: LinkedItem[]): Map<SkillId, SkillContext> {
  const contexts = new Map<SkillId, SkillContext>();
  for (const item of items) {
    for (const id of item.skills) {
      const current = contexts.get(id);
      contexts.set(id, !current || current === item.group ? item.group : 'both');
    }
  }
  return contexts;
}

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly json = inject(GetJsonService);
  private readonly langService = inject(LanguageService);
  private readonly contexts = deriveContexts(linkedItems(content[0]));

  getCategories(): Observable<SkillCategoryView[]> {
    return this.langService.currentLanguage$.pipe(
      map(lang => SKILL_CATEGORIES.map(category => ({
        id: category,
        skills: SKILL_IDS
          .filter(id => SKILLS[id].category === category)
          .map(id => {
            const def: SkillDef = SKILLS[id];
            return {
              id,
              label: localize(def.label, lang),
              years: def.years,
              level: def.level,
              context: this.contexts.get(id) ?? null,
              note: def.note && localize(def.note, lang),
            };
          }),
      }))),
    );
  }

  getLinkedItems(): Observable<LinkedItem[]> {
    return this.json.getCVData().pipe(map(linkedItems));
  }
}
