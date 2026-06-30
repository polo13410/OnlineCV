import { MagneticScrollComponent } from './magnetic-scroll.component';

describe('MagneticScrollComponent.exceedsStage', () => {
  it('returns false when the tallest card fits within the stage minus safety', () => {
    expect(MagneticScrollComponent.exceedsStage(600, 720, 24)).toBe(false);
  });

  it('returns true when the tallest card exceeds the stage minus safety', () => {
    expect(MagneticScrollComponent.exceedsStage(710, 720, 24)).toBe(true);
  });

  it('counts the safety margin as part of the budget', () => {
    // 700 fits in 720 raw, but not in 720 - 24 = 696
    expect(MagneticScrollComponent.exceedsStage(700, 720, 24)).toBe(true);
  });

  it('returns false for a non-positive stage height (not yet measured)', () => {
    expect(MagneticScrollComponent.exceedsStage(700, 0, 24)).toBe(false);
  });
});
