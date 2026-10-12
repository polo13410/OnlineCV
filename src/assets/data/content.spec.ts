import { content } from './content';
import { ExperienceBase } from './contentInterface';
import { SKILLS } from './skills';

// Language-neutral fields are duplicated in every language; they must never drift apart.
describe('content data', () => {
  const [fr, en] = content;
  const neutral = (items: (ExperienceBase & { links?: unknown })[] = []) =>
    items.map(({ id, icon, iconFill, iconDark, dateFrom, dateTo, skills, links }) =>
      ({ id, icon, iconFill, iconDark, dateFrom, dateTo, skills, links }));

  it('has the same language-neutral fields in FR and EN', () => {
    expect(neutral(en.experiences?.pro)).toEqual(neutral(fr.experiences?.pro));
    expect(neutral(en.experiences?.stage)).toEqual(neutral(fr.experiences?.stage));
    expect(neutral(en.educations)).toEqual(neutral(fr.educations));
    expect(neutral(en.projects)).toEqual(neutral(fr.projects));
  });

  it('uses unique ids across all experiences', () => {
    const ids = [
      ...neutral(fr.experiences?.pro), ...neutral(fr.experiences?.stage),
      ...neutral(fr.educations), ...neutral(fr.projects),
    ].map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only references registered skills', () => {
    const all = [...(fr.experiences?.pro ?? []), ...(fr.experiences?.stage ?? []), ...(fr.projects ?? [])];
    for (const item of all) {
      for (const skill of item.skills) expect(SKILLS[skill]).withContext(`${item.id} → ${skill}`).toBeDefined();
    }
  });
});
