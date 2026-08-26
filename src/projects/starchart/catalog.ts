import {
  STAR_COUNT,
  STAR_DATA_B64,
  MAG_MIN,
  MAG_MAX,
  BV_MIN,
  BV_MAX,
} from './data/stars.gen';
import { STAR_NAMES } from './data/starNames.gen';
import type { SkyView } from './sky';
import { detailScale } from './layout';

/**
 * The real catalogue: 41,411 stars to magnitude 8, J2000.
 *
 * `data/stars.gen.ts` stores them column-major and sorted brightest-first, which
 * is what makes both hot paths cheap here — the limiting-magnitude cut is a
 * binary search over a monotonic column followed by a prefix walk, and no star
 * fainter than the cut is ever touched.
 */

export interface Star {
  /** Index into the packed catalogue, and the key into the name table. */
  idx: number;
  /** Logical pixels on the plate. */
  x: number;
  y: number;
  ra: number;
  dec: number;
  /** Apparent visual magnitude. Lower is brighter; Sirius is -1.44. */
  mag: number;
  /** Drawn radius in logical pixels, already scaled for the plate size. */
  r: number;
  alpha: number;
  /**
   * Colour temperature in -1..1 from the B-V index: -1 is a hot blue O/B star,
   * +1 a cool red M. Around 0 is roughly solar.
   */
  temp: number;
}

export interface StarName {
  /** Proper name, e.g. `Betelgeuse`. Empty for most stars. */
  proper: string;
  /** Bayer letter, e.g. `α`. */
  bayer: string;
  /** Flamsteed number. */
  flam: string;
  /** Three-letter constellation abbreviation, e.g. `Ori`. */
  con: string;
  /** Henry Draper number, digits only. */
  hd: string;
}

// --- decode ------------------------------------------------------------------

interface PackedCatalog {
  ra: Uint16Array;
  dec: Uint16Array;
  mag: Uint8Array;
  bv: Uint8Array;
}

let packed: PackedCatalog | null = null;

function decode(): PackedCatalog {
  if (packed) return packed;

  // The generated blob is newline-wrapped; atob is specified to strip ASCII
  // whitespace, but stripping it here means not depending on that.
  const bin = atob(STAR_DATA_B64.replace(/\s+/g, ''));
  const n = STAR_COUNT;
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  // The u16 columns are copied rather than viewed: `bytes.buffer` carries no
  // alignment guarantee for a 2-byte view once an offset is involved.
  const ra = new Uint16Array(n);
  const dec = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    ra[i] = bytes[i * 2] | (bytes[i * 2 + 1] << 8);
    dec[i] = bytes[n * 2 + i * 2] | (bytes[n * 2 + i * 2 + 1] << 8);
  }

  packed = {
    ra,
    dec,
    mag: bytes.subarray(n * 4, n * 5),
    bv: bytes.subarray(n * 5, n * 6),
  };
  return packed;
}

let nameTable: Map<number, StarName> | null = null;

function names(): Map<number, StarName> {
  if (nameTable) return nameTable;
  const m = new Map<number, StarName>();
  for (const line of STAR_NAMES.split('\n')) {
    if (!line) continue;
    const [idx, proper, bayer, flam, con, hd] = line.split('|');
    m.set(Number(idx), { proper, bayer, flam, con, hd });
  }
  nameTable = m;
  return m;
}

export function starName(idx: number): StarName | undefined {
  return names().get(idx);
}

const unMag = (q: number) => MAG_MIN + (q / 255) * (MAG_MAX - MAG_MIN);

/** Largest index whose magnitude is still within the limit. -1 if none. */
function lastWithin(mag: Uint8Array, limit: number): number {
  let lo = 0;
  let hi = mag.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (unMag(mag[mid]) <= limit) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

/** The magnitude of the brightest star in the catalogue — Sirius. */
export const BRIGHTEST_MAG = -1.44;

// --- build -------------------------------------------------------------------

export interface Catalog {
  /** Everything projected inside the plate, brightest first. */
  stars: Star[];
  /** The handful bright enough to carry a bloom. A subset of `stars`. */
  beacons: Star[];
  /** How many catalogue entries passed the magnitude cut, in or out of frame. */
  surveyed: number;
}

/**
 * Project the catalogue onto the plate.
 *
 * Star size is driven by magnitude the way a printed chart does it, not by a
 * random draw: the radius runs off a power of the magnitude below the limit, so
 * lowering the limiting magnitude does not merely delete faint stars, it also
 * rescales what is left — which is exactly how a shallower plate looks.
 */
export function buildCatalog(
  view: SkyView,
  limitingMag: number,
  width: number,
  height: number,
): Catalog {
  const { ra, dec, mag, bv } = decode();
  const s = detailScale(width, height);
  const last = lastWithin(mag, limitingMag);
  if (last < 0) return { stars: [], beacons: [], surveyed: 0 };

  const span = Math.max(0.5, limitingMag - BRIGHTEST_MAG);
  // Off-plate stars still have to be projected, but they must not be kept; the
  // margin lets a bloom or a label leader originate just outside the frame.
  const pad = Math.max(width, height) * 0.06;

  const stars: Star[] = [];

  for (let i = 0; i <= last; i++) {
    const raDeg = (ra[i] / 65535) * 360;
    const decDeg = (dec[i] / 65535) * 180 - 90;
    const q = view.project(raDeg, decDeg);
    if (!q) continue;
    const [x, y] = q;
    if (x < -pad || x > width + pad || y < -pad || y > height + pad) continue;

    const m = unMag(mag[i]);
    // 0 at the limit, 1 at the brightest star in the sky.
    const rel = Math.min(1, Math.max(0, (limitingMag - m) / span));

    const bvVal = BV_MIN + (bv[i] / 255) * (BV_MAX - BV_MIN);
    // 0.0 (A0) sits at the neutral point and 1.4 (early M) at fully warm, which
    // is roughly where the eye stops reading a star as white.
    const temp = Math.max(-1, Math.min(1, bvVal / 1.4));

    stars.push({
      idx: i,
      x,
      y,
      ra: raDeg,
      dec: decDeg,
      mag: m,
      // Both curves are deliberately shallow. A plate normalised hard against
      // Sirius pushes everything in an ordinary field down into the noise, and
      // the result reads as an empty sky rather than a deep one — real charts
      // plot a seventh-magnitude star as a small dot, not as nothing.
      r: (0.36 + 4.0 * Math.pow(rel, 1.5)) * s,
      alpha: 0.2 + 0.8 * Math.pow(rel, 0.8),
      temp,
    });
  }

  // Bright enough to be an anchor, and rare enough to stay one. A field with no
  // naked-eye star still gets its brightest few, or the plate has no focus.
  const beacons: Star[] = [];
  for (const st of stars) {
    if (beacons.length >= 14) break;
    if (st.mag > 4.2 && beacons.length >= 3) break;
    beacons.push(st);
  }

  return { stars, beacons, surveyed: last + 1 };
}
