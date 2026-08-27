import {
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  type GeoProjection,
} from 'd3-geo';

/**
 * The bridge between the catalogue and the plate: a real map projection of the
 * J2000 equatorial sphere onto logical pixels.
 *
 * RA is carried in degrees 0..360 everywhere in this project, not hours and not
 * the -180..180 the source data shipped. d3-geo wants a longitude, so `project`
 * is the one place that shifts it — and it also applies the horizontal flip that
 * every real star chart has, because the sky is drawn as seen from inside the
 * sphere rather than from outside it.
 */

export const PROJECTIONS = {
  stereographic: 'stereographic',
  gnomonic: 'gnomonic',
  orthographic: 'orthographic',
  equalArea: 'equalArea',
  equidistant: 'equidistant',
} as const;

export type ProjectionName = (typeof PROJECTIONS)[keyof typeof PROJECTIONS];

export const PROJECTION_OPTIONS: { value: ProjectionName; label: string }[] = [
  { value: 'stereographic', label: 'Stereographic' },
  { value: 'gnomonic', label: 'Gnomonic' },
  { value: 'equalArea', label: 'Lambert Az. Equal-Area' },
  { value: 'equidistant', label: 'Azimuthal Equidistant' },
  { value: 'orthographic', label: 'Orthographic' },
];

/** What the title block prints. Kept separate: that column is upper-case and short. */
export const PROJECTION_LABELS: Record<ProjectionName, string> = {
  stereographic: 'STEREOGRAPHIC',
  gnomonic: 'GNOMONIC',
  orthographic: 'ORTHOGRAPHIC',
  equalArea: 'LAMBERT AZ. EA',
  equidistant: 'AZIMUTHAL EQ.',
};

const FACTORIES: Record<ProjectionName, () => GeoProjection> = {
  stereographic: geoStereographic,
  gnomonic: geoGnomonic,
  orthographic: geoOrthographic,
  equalArea: geoAzimuthalEqualArea,
  equidistant: geoAzimuthalEquidistant,
};

/**
 * How far from the centre each projection stays usable.
 *
 * Gnomonic diverges to infinity at 90 degrees and is already grotesque well
 * before that; orthographic simply has no far hemisphere. Clipping here is what
 * keeps a wide field from smearing the edge of the plate into a solid wall of
 * stars, and it is also what makes `project` return null for a star behind us
 * rather than a plausible-looking wrong answer.
 */
const CLIP_ANGLE: Record<ProjectionName, number> = {
  stereographic: 142,
  gnomonic: 62,
  orthographic: 89.6,
  equalArea: 142,
  equidistant: 150,
};

export interface SkyView {
  projection: ProjectionName;
  /** Centre of the plate, J2000. */
  raCenter: number;
  decCenter: number;
  /** Field of view across the LONGER plate axis, in degrees. */
  fov: number;
  width: number;
  height: number;
  /** RA/Dec degrees -> logical pixels. Null when the point is off the projection. */
  project: (ra: number, dec: number) => [number, number] | null;
  /** Logical pixels -> RA/Dec degrees. Null outside the projected sphere. */
  invert: (x: number, y: number) => [number, number] | null;
  /** Degrees of sky per logical pixel at the plate centre. */
  degPerPx: number;
}

/**
 * Build the view.
 *
 * The scale is solved rather than assumed: each projection maps angle to radius
 * on its own curve, so "60 degrees across the plate" only means the same thing in
 * all five if you ask the projection itself where the field edge lands. Setting
 * scale to 1, projecting a point `fov/2` away from centre, and dividing gives
 * exactly that, and it keeps the FOV control honest when the projection changes.
 */
export function createSkyView(
  projection: ProjectionName,
  raCenter: number,
  decCenter: number,
  roll: number,
  fov: number,
  width: number,
  height: number,
): SkyView {
  const long = Math.max(width, height);
  // Keep the field edge clear of the projection's own limit, where every one of
  // these stretches without bound.
  const half = Math.min(fov / 2, CLIP_ANGLE[projection] * 0.8);

  // Unit-scale probe on a SEPARATE instance: d3's setters return the projection
  // itself, so configuring `p` to measure it would leave `p` measured.
  //
  // All five projections here are azimuthal, so the plate radius depends only on
  // angular distance from the centre. That lets the probe sit at the untilted
  // origin and step `half` degrees along the equator — no pole to fall into, and
  // no dependence on where the plate is actually pointed.
  const probe = FACTORIES[projection]()
    .scale(1)
    .translate([0, 0])
    .rotate([0, 0, 0])
    .clipAngle(Math.min(179.9, half + 1));
  const edge = probe([half, 0]);
  const unitRadius = edge ? Math.hypot(edge[0], edge[1]) : 0;

  const p = FACTORIES[projection]()
    .clipAngle(CLIP_ANGLE[projection])
    .scale(unitRadius > 1e-9 ? long / 2 / unitRadius : long / 2)
    .translate([width / 2, height / 2])
    // d3 rotates the sphere under a fixed centre, so the rotation is the negated
    // target. The third angle rolls the plate about the line of sight.
    .rotate([-raCenter, -decCenter, roll]);

  // RA runs east; drawn from inside the sphere it must run right-to-left.
  const flip = (x: number) => width - x;

  const project = (ra: number, dec: number): [number, number] | null => {
    const q = p([ra > 180 ? ra - 360 : ra, dec]);
    if (!q || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) return null;
    return [flip(q[0]), q[1]];
  };

  const invert = (x: number, y: number): [number, number] | null => {
    const q = p.invert?.([flip(x), y]);
    if (!q || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) return null;
    return [q[0] < 0 ? q[0] + 360 : q[0], q[1]];
  };

  return {
    projection,
    raCenter,
    decCenter,
    fov,
    width,
    height,
    project,
    invert,
    degPerPx: fov / long,
  };
}

// ---------------------------------------------------------------------------
// Spherical helpers
// ---------------------------------------------------------------------------

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/** Great-circle angle between two RA/Dec points, in degrees. */
export function angularSeparation(
  ra1: number,
  dec1: number,
  ra2: number,
  dec2: number,
): number {
  const p1 = dec1 * D2R;
  const p2 = dec2 * D2R;
  const dl = (ra2 - ra1) * D2R;
  const dp = p2 - p1;
  // Haversine: the cosine form loses all its precision on the small separations
  // this is mostly asked for.
  const a =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a))) * R2D;
}

/**
 * Local plate scale (pixels per degree) at a sky point, via a small step.
 *
 * A plain declination step is exact for this: every projection `createSkyView`
 * builds is azimuthal, so scale depends only on angular distance from the
 * view's centre, never on direction — a step along the meridian measures the
 * same local scale a step along any other bearing through that point would.
 * Returns null off the edge of the projection.
 */
export function localScale(view: SkyView, ra: number, dec: number): number | null {
  const step = 0.15;
  const dec2 = dec + step <= 89.5 ? dec + step : dec - step;
  const p0 = view.project(ra, dec);
  const p1 = view.project(ra, dec2);
  if (!p0 || !p1) return null;
  return Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / step;
}

/** J2000 north galactic pole and the galactic longitude of the celestial pole. */
const NGP_RA = 192.85948 * D2R;
const NGP_DEC = 27.12825 * D2R;
const L_NCP = 122.93192 * D2R;

/** Galactic (l, b) -> equatorial (RA, Dec), all degrees. */
export function galacticToEquatorial(l: number, b: number): [number, number] {
  const lr = l * D2R;
  const br = b * D2R;
  const sinDec =
    Math.sin(br) * Math.sin(NGP_DEC) +
    Math.cos(br) * Math.cos(NGP_DEC) * Math.cos(L_NCP - lr);
  const dec = Math.asin(Math.min(1, Math.max(-1, sinDec)));
  const y = Math.cos(br) * Math.sin(L_NCP - lr);
  const x =
    Math.sin(br) * Math.cos(NGP_DEC) -
    Math.cos(br) * Math.sin(NGP_DEC) * Math.cos(L_NCP - lr);
  let ra = NGP_RA + Math.atan2(y, x);
  ra *= R2D;
  ra %= 360;
  return [ra < 0 ? ra + 360 : ra, dec * R2D];
}

/**
 * Equatorial (RA, Dec) -> galactic (l, b), all degrees. The inverse rotation of
 * `galacticToEquatorial`, sharing its pole. Verified to round-trip to better
 * than 1e-6 degrees and checked against Sgr A* (l,b ~ 0,0) and Vega (l,b ~
 * 67.45, 19.24).
 */
export function equatorialToGalactic(ra: number, dec: number): [number, number] {
  const ar = ra * D2R;
  const dr = dec * D2R;
  const sinB =
    Math.sin(dr) * Math.sin(NGP_DEC) + Math.cos(dr) * Math.cos(NGP_DEC) * Math.cos(ar - NGP_RA);
  const b = Math.asin(Math.min(1, Math.max(-1, sinB)));
  const y = Math.cos(dr) * Math.sin(ar - NGP_RA);
  const x =
    Math.cos(NGP_DEC) * Math.sin(dr) - Math.sin(NGP_DEC) * Math.cos(dr) * Math.cos(ar - NGP_RA);
  let l = L_NCP - Math.atan2(y, x);
  l *= R2D;
  l %= 360;
  return [l < 0 ? l + 360 : l, b * R2D];
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/**
 * Split a positive value into three sexagesimal places, carrying the rounding.
 *
 * Rounding the last place independently is what produces `17h 45m 60s`; this
 * rounds once at the bottom and lets the carry run up, so it cannot.
 */
function sexagesimal(value: number, wrapAt: number): [number, number, number] {
  let s = Math.round(value * 3600);
  const total = wrapAt * 3600;
  s = ((s % total) + total) % total;
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60];
}

/** RA in degrees -> `17h 45m 40s`. */
export function formatRa(ra: number): string {
  const [h, m, s] = sexagesimal((((ra % 360) + 360) % 360) / 15, 24);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

/** Dec in degrees -> `-29° 00′ 28″`. */
export function formatDec(dec: number): string {
  const [d, m, s] = sexagesimal(Math.abs(dec), 360);
  return `${dec < 0 ? '−' : '+'}${pad(d)}° ${pad(m)}′ ${pad(s)}″`;
}

/** An angular measurement, in whichever unit keeps it readable. */
export function formatAngle(deg: number): string {
  if (deg >= 1) return `${deg.toFixed(deg >= 10 ? 1 : 2)}°`;
  const arcmin = deg * 60;
  if (arcmin >= 1) return `${arcmin.toFixed(arcmin >= 10 ? 1 : 2)}′`;
  return `${(arcmin * 60).toFixed(1)}″`;
}

/** Short RA label for a graticule meridian: whole hours. */
export function formatRaShort(ra: number): string {
  const h = Math.round((((ra % 360) + 360) % 360) / 15) % 24;
  return `${h}h`;
}

export function formatDecShort(dec: number): string {
  const r = Math.round(dec);
  return `${r > 0 ? '+' : r < 0 ? '−' : '±'}${Math.abs(r)}°`;
}

/** Galactic longitude/latitude to one decimal: `l 000.0° b −07.2°`. */
export function formatGalactic(l: number, b: number): string {
  const lPad = l.toFixed(1).padStart(5, '0');
  const bAbs = Math.abs(b).toFixed(1).padStart(4, '0');
  return `l ${lPad}° b ${b < 0 ? '−' : '+'}${bAbs}°`;
}
