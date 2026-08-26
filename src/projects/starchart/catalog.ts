import { createRng, randomInRange } from '@core/utils/random';
import type { HazeField } from './field';
import { detailScale } from './layout';

/** Spectral tint slot. 0 = white, 1 = warm, 2 = cool. */
export type Tint = 0 | 1 | 2;

export interface Star {
  x: number;
  y: number;
  /** Radius in logical pixels, already multiplied by the detail scale. */
  r: number;
  /** Magnitude class: 0 is a bright anchor, 4 is a sub-pixel speck. */
  mag: number;
  alpha: number;
  tint: Tint;
}

/**
 * One catalogue entry per class. `weight` is the share of the total count, so
 * anchors stay rare no matter how the density dial moves.
 */
const MAG_CLASSES = [
  { weight: 0.008, rMin: 2.3, rMax: 4.0, aMin: 0.85, aMax: 1.0 },
  { weight: 0.032, rMin: 1.45, rMax: 2.25, aMin: 0.68, aMax: 0.94 },
  { weight: 0.08, rMin: 0.95, rMax: 1.45, aMin: 0.48, aMax: 0.76 },
  { weight: 0.18, rMin: 0.62, rMax: 0.95, aMin: 0.3, aMax: 0.56 },
  { weight: 0.7, rMin: 0.3, rMax: 0.6, aMin: 0.12, aMax: 0.38 },
];

/** Logical px² of plate per star at density 1.0, measured at the 1080p reference. */
const AREA_PER_STAR = 880;

export interface Catalog {
  stars: Star[];
  /** Magnitude-0 entries, kept separately: they carry the bloom and anchor the graph. */
  beacons: Star[];
}

/**
 * Seeded star catalogue.
 *
 * Count is driven by AREA divided by the squared detail scale, not by a fixed
 * number — that keeps a 3440x1440 ultrawide from reading sparse and a 1080x1920
 * portrait from reading crowded, while a 4K render is the 1080p plate drawn twice
 * as large rather than four times as busy.
 */
export function buildCatalog(
  seed: string,
  width: number,
  height: number,
  density: number,
  spectralTint: number,
  haze: HazeField,
): Catalog {
  const rng = createRng(`${seed}_catalog`);
  const s = detailScale(width, height);
  const total = Math.round(((width * height) / (s * s) / AREA_PER_STAR) * density);

  const cum: number[] = [];
  let acc = 0;
  for (const c of MAG_CLASSES) {
    acc += c.weight;
    cum.push(acc);
  }

  const stars: Star[] = [];
  const beacons: Star[] = [];
  const tintChance = spectralTint * 0.4;

  // Rejection sampling against the haze field clusters the field along the
  // galactic plane while leaving a thin scatter everywhere else.
  let attempts = 0;
  const maxAttempts = total * 12;
  while (stars.length < total && attempts < maxAttempts) {
    attempts++;
    const x = rng() * width;
    const y = rng() * height;
    const f = haze.at(x, y);
    // The floor matters more than the slope: at 0.22 the off-band field went
    // visibly dead in the mid-plate, which reads as a hole rather than as depth.
    if (rng() > 0.45 + 0.55 * Math.pow(f, 1.1)) continue;

    const roll = rng() * acc;
    let mag = MAG_CLASSES.length - 1;
    for (let i = 0; i < cum.length; i++) {
      if (roll <= cum[i]) {
        mag = i;
        break;
      }
    }
    const cls = MAG_CLASSES[mag];

    let tint: Tint = 0;
    if (rng() < tintChance) tint = rng() < 0.55 ? 1 : 2;

    const star: Star = {
      x,
      y,
      r: randomInRange(rng, cls.rMin, cls.rMax) * s,
      mag,
      alpha: randomInRange(rng, cls.aMin, cls.aMax),
      tint,
    };
    stars.push(star);
    if (mag === 0) beacons.push(star);
  }

  return { stars, beacons };
}
