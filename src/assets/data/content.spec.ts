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
          expect(parseInt(skill.time, 10)).withContext(ctx).toBe(skill.years);
        }
      }
    }
  });

  it('fr and en agree on years and levelKey for each skill position', () => {
    const [fr, en] = content;
    expect(fr.language).toBe('french');
    expect(en.language).toBe('english');
    expect(fr.skillCategories.length).toBe(en.skillCategories.length);
    fr.skillCategories.forEach((frCat, ci) => {
      expect(frCat.skills.length)
        .withContext(frCat.name)
        .toBe(en.skillCategories[ci].skills.length);
      frCat.skills.forEach((frSkill, si) => {
        const enSkill = en.skillCategories[ci].skills[si];
        expect(frSkill.years).withContext(frSkill.lang).toBe(enSkill.years);
        expect(frSkill.levelKey).withContext(frSkill.lang).toBe(enSkill.levelKey);
      });
    });
  });
});
