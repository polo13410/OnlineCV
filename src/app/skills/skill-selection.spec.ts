import { describe, expect, it } from 'vitest';
import { SkillId } from 'src/assets/data/skills';
import { matching, selectable, toggle } from './skill-selection';

describe('skill selection', () => {
  const items: { id: string; skills: SkillId[] }[] = [
    { id: 'a', skills: ['typescript', 'htmlcss'] },
    { id: 'b', skills: ['typescript', 'react'] },
    { id: 'c', skills: ['python'] },
  ];
  const ids = (list: { id: string }[]) => list.map(i => i.id);

  it('starts with nothing matched and everything selectable', () => {
    expect(matching(items, [])).toEqual([]);
    expect(selectable(items, [])).toBeNull();
  });

  it('selects a first skill and greys skills never used with it', () => {
    const selected = toggle(items, [], 'typescript');
    expect(selected).toEqual(['typescript']);
    expect(ids(matching(items, selected))).toEqual(['a', 'b']);
    const allowed = selectable(items, selected)!;
    expect(allowed.has('htmlcss')).toBe(true);
    expect(allowed.has('python')).toBe(false);
  });

  it('adds a selectable skill and narrows the results', () => {
    const selected = toggle(items, ['typescript'], 'htmlcss');
    expect(selected).toEqual(['typescript', 'htmlcss']);
    expect(ids(matching(items, selected))).toEqual(['a']);
  });

  it('restarts from a greyed skill', () => {
    expect(toggle(items, ['typescript', 'htmlcss'], 'python')).toEqual(['python']);
  });

  it('removes a selected skill, down to an empty selection', () => {
    expect(toggle(items, ['typescript', 'htmlcss'], 'typescript')).toEqual(['htmlcss']);
    expect(toggle(items, ['htmlcss'], 'htmlcss')).toEqual([]);
  });

  it('selects a skill used nowhere, with no results', () => {
    const selected = toggle(items, ['typescript'], 'spring');
    expect(selected).toEqual(['spring']);
    expect(matching(items, selected)).toEqual([]);
  });

  it('never empties the results through successive additions', () => {
    let selected: SkillId[] = ['typescript'];
    for (const skill of selectable(items, selected)!) {
      if (selected.includes(skill)) continue;
      const next = toggle(items, selected, skill);
      expect(matching(items, next).length).toBeGreaterThan(0);
    }
  });
});
