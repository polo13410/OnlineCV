// Pure selection rules for the skills page (see docs/superpowers/specs/2026-10-12-skill-linking-design.md §4).
import { SkillId } from 'src/assets/data/skills';

export interface Tagged {
  skills: readonly SkillId[];
}

/** Items using every selected skill. */
export function matching<T extends Tagged>(items: T[], selected: readonly SkillId[]): T[] {
  if (!selected.length) return [];
  return items.filter(item => selected.every(s => item.skills.includes(s)));
}

/** Skills that can be added to the selection; null means "all" (nothing selected yet). */
export function selectable(items: Tagged[], selected: readonly SkillId[]): Set<SkillId> | null {
  if (!selected.length) return null;
  return new Set(matching(items, selected).flatMap(item => item.skills));
}

/** Selected → removed; selectable → added; greyed → selection restarts from it. */
export function toggle(items: Tagged[], selected: readonly SkillId[], clicked: SkillId): SkillId[] {
  if (selected.includes(clicked)) return selected.filter(s => s !== clicked);
  const allowed = selectable(items, selected);
  return !allowed || allowed.has(clicked) ? [...selected, clicked] : [clicked];
}
