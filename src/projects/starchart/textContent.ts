import { randomInt, randomPick } from '@core/utils/random';
import { starName, type Star } from './catalog';

type Rng = () => number;

/**
 * Plate text.
 *
 * The split here is deliberate and it is the whole conceit of the project. Where
 * a real designation exists — a star's name, a constellation, a coordinate, an
 * angular separation — the plate prints the real one. The survey that supposedly
 * made the plate, and the trade network drawn over it, are invented, and only
 * those are randomised.
 */

const SURVEY_NAMES = [
  'DEEP FIELD SURVEY',
  'GALACTIC PLATE SERIES',
  'CORE SECTOR SURVEY',
  'OUTER REACH CENSUS',
  'MERIDIAN PLATE',
];
const NODE_KINDS = ['STN', 'DEP', 'RLY', 'JCT', 'BCN', 'YRD'];
const NOTES = [
  'PROPER MOTION NOT APPLIED',
  'PLATE GRAIN VISIBLE',
  'REDUCED FROM 4 EXPOSURES',
  'ASTROMETRY: HIPPARCOS/TYCHO',
  'NO FLAT-FIELD APPLIED',
  'POSITIONS J2000.0',
];

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

/**
 * How a star is named on the plate, in the order a chart would prefer.
 *
 * Proper name first, then the Bayer letter with its constellation's Latin
 * genitive, then Flamsteed, then the Henry Draper number. Returns null for the
 * overwhelming majority of the catalogue, which carries no designation at all —
 * and those stars are simply not labelled, exactly as on a real plate.
 */
export function starDesignation(
  star: Star,
  genitives?: Map<string, string>,
): string | null {
  const n = starName(star.idx);
  if (!n) return null;
  if (n.proper) return n.proper.toUpperCase();
  const con = n.con ? (genitives?.get(n.con) ?? n.con) : '';
  if (n.bayer && con) return `${n.bayer} ${con}`;
  if (n.flam && con) return `${n.flam} ${con}`;
  if (n.hd) return `HD ${n.hd}`;
  if (n.bayer) return n.bayer;
  return null;
}

/** The short form, for tight spots: `α Ori`, `HD 39801`. */
export function starDesignationShort(star: Star): string | null {
  const n = starName(star.idx);
  if (!n) return null;
  if (n.bayer && n.con) return `${n.bayer} ${n.con}`;
  if (n.flam && n.con) return `${n.flam} ${n.con}`;
  if (n.hd) return `HD ${n.hd}`;
  if (n.proper) return n.proper.toUpperCase();
  return null;
}

/** A magnitude readout, as a plate would print it. */
export function magText(mag: number): string {
  return `${mag >= 0 ? '+' : '−'}${Math.abs(mag).toFixed(2)}`;
}

export function nodeTag(rng: Rng): string {
  return `${randomPick(rng, NODE_KINDS)}-${pad(randomInt(rng, 1, 999), 3)}`;
}

export function insetLabel(rng: Rng): string {
  return `DET ${String.fromCharCode(65 + randomInt(rng, 0, 11))}/${pad(randomInt(rng, 1, 24), 2)}`;
}

export interface PlateIdentity {
  survey: string;
  note: string;
}

/** The invented half: which fictional survey this plate came from. */
export function plateIdentity(rng: Rng): PlateIdentity {
  return {
    survey: randomPick(rng, SURVEY_NAMES),
    note: randomPick(rng, NOTES),
  };
}

/**
 * The plate's designation, built from where it actually points.
 *
 * Real charts are numbered by field, not arbitrarily — so this reads
 * `PLATE ORI+00-083`: the dominant constellation, the declination, and the RA.
 */
export function plateDesignation(
  con: string | null,
  ra: number,
  dec: number,
): string {
  const sign = dec < 0 ? '-' : '+';
  const d = pad(Math.round(Math.abs(dec)), 2);
  const r = pad(Math.round(ra) % 360, 3);
  return `PLATE ${(con ?? 'FLD').toUpperCase()}${sign}${d}-${r}`;
}
