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
    .replace(/[̀-ͯ]/g, '')
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
