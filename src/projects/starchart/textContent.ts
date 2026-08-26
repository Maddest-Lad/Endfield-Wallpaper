import { randomInt, randomPick, randomInRange } from '@core/utils/random';

type Rng = () => number;

const CATALOG_PREFIXES = ['HD', 'HR', 'GJ', 'BD', 'NGC', 'IC', 'PGC', 'TYC', 'KX', 'LP'];
const GREEK = ['ALP', 'BET', 'GAM', 'DEL', 'EPS', 'ZET', 'ETA', 'THE', 'IOT', 'KAP', 'LAM', 'MU'];
const SECTOR_ROOTS = [
  'VEL',
  'CAR',
  'LYR',
  'ARA',
  'CRU',
  'PYX',
  'AQL',
  'CET',
  'DOR',
  'HYA',
  'ORI',
  'PAV',
  'TUC',
  'VOL',
];
const PROJECTIONS = [
  'STEREOGRAPHIC',
  'GNOMONIC',
  'AZIMUTHAL EQ.',
  'ORTHOGRAPHIC',
  'LAMBERT AZ.',
];
const SURVEY_NAMES = [
  'DEEP FIELD SURVEY',
  'GALACTIC PLATE SERIES',
  'CORE SECTOR SURVEY',
  'OUTER REACH CENSUS',
  'MERIDIAN PLATE',
];
const NODE_KINDS = ['STN', 'DEP', 'RLY', 'JCT', 'BCN', 'YRD'];
const NOTES = [
  'PROPER MOTION CORRECTED',
  'PLATE GRAIN VISIBLE',
  'LIMITING MAG 21.4',
  'REDUCED FROM 4 EXPOSURES',
  'ASTROMETRY: PROVISIONAL',
  'NO FLAT-FIELD APPLIED',
];

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

/** A catalogue designator, e.g. `HD-4417`, `NGC 2244`, `TYC 8102-31`. */
export function designator(rng: Rng): string {
  const p = randomPick(rng, CATALOG_PREFIXES);
  const style = rng();
  if (style < 0.28) return `${p} ${randomInt(rng, 100, 9999)}`;
  if (style < 0.52) return `${p}-${randomInt(rng, 1000, 9999)}`;
  if (style < 0.72) return `${randomPick(rng, GREEK)} ${randomPick(rng, SECTOR_ROOTS)}`;
  if (style < 0.88) return `${p} ${randomInt(rng, 1000, 9999)}-${randomInt(rng, 10, 99)}`;
  return `${p}/${pad(randomInt(rng, 1, 99), 2)}`;
}

/** A graticule-cell sector label, e.g. `SEC VEL-07`. */
export function sectorLabel(rng: Rng): string {
  return `SEC ${randomPick(rng, SECTOR_ROOTS)}-${pad(randomInt(rng, 1, 48), 2)}`;
}

/** A distance readout for a dimension callout. */
export function distanceText(rng: Rng): string {
  const unit = rng() < 0.6 ? 'pc' : 'ly';
  const value =
    unit === 'pc'
      ? randomInRange(rng, 2.4, 480).toFixed(rng() < 0.5 ? 1 : 2)
      : randomInRange(rng, 8, 1600).toFixed(0);
  return `${value} ${unit}`;
}

export function nodeTag(rng: Rng): string {
  return `${randomPick(rng, NODE_KINDS)}-${pad(randomInt(rng, 1, 999), 3)}`;
}

export function insetLabel(rng: Rng): string {
  return `DET ${String.fromCharCode(65 + randomInt(rng, 0, 11))}/${pad(randomInt(rng, 1, 24), 2)}`;
}

export interface PlateIdentity {
  designation: string;
  survey: string;
  projection: string;
  epoch: string;
  scale: string;
  note: string;
}

export function plateIdentity(rng: Rng): PlateIdentity {
  return {
    designation: `PLATE ${randomPick(rng, SECTOR_ROOTS)}-${pad(randomInt(rng, 1, 999), 3)}${String.fromCharCode(65 + randomInt(rng, 0, 5))}`,
    survey: randomPick(rng, SURVEY_NAMES),
    projection: randomPick(rng, PROJECTIONS),
    epoch: `J${randomInt(rng, 2200, 2899)}.${pad(randomInt(rng, 0, 9), 1)}`,
    scale: `1:${randomInt(rng, 2, 96)}.${pad(randomInt(rng, 0, 9), 1)}E+16`,
    note: randomPick(rng, NOTES),
  };
}
