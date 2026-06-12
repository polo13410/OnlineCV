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
      for (const n of [1, 3, 6, 8, 9, 12]) {
        expect(service.restSlots(n, 's').length).toBe(n);
      }
    });

    it('keeps slots within bounds (desktop and mobile)', () => {
      for (const variant of ['desktop', 'mobile'] as const) {
        for (const n of [2, 3, 6, 8, 9, 12]) {
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
      for (const variant of ['desktop', 'mobile'] as const) {
        for (const seed of ['any-seed', 'skills']) {
          for (const n of [3, 4, 5, 6, 7, 8, 9, 12]) {
            const slots = service.restSlots(n, seed, variant);
            for (let i = 0; i < slots.length; i++) {
              for (let j = i + 1; j < slots.length; j++) {
                const d = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y);
                expect(d)
                  .withContext(`variant=${variant} seed=${seed} n=${n} pair ${i},${j}`)
                  .toBeGreaterThanOrEqual(14);
              }
            }
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
      expect(service.bubbleDiameter(0, 6)).toBe(service.MIN_DIAMETER);
      expect(service.bubbleDiameter(1, 6)).toBeGreaterThanOrEqual(service.MIN_DIAMETER);
      expect(service.bubbleDiameter(1, 6)).toBeLessThan(service.bubbleDiameter(3, 6));
      expect(service.bubbleDiameter(9, 6)).toBe(service.MAX_DIAMETER);
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
