import { starName, starPoint, namedStarIndices } from './catalog';
import { CONSTELLATIONS } from './data/constellations.gen';
import { SKY_REGIONS } from './regions';

/**
 * Everything on the plate you can aim at by name.
 *
 * One index over three sources — designated stars, the IAU figures, and the
 * named regions — because from the user's side they are the same question
 * ("point at Betelgeuse", "point at Orion") and splitting them into separate
 * boxes would only make the caller choose which box to type in.
 */

export type SkyTargetKind = 'star' | 'constellation' | 'region';

export interface SkyTarget {
  kind: SkyTargetKind;
  /** What the row shows in the accent colour. */
  label: string;
  /** The muted second half of the row: designation, magnitude, extent. */
  detail: string;
  ra: number;
  dec: number;
  /**
   * Field of view that frames the target, in degrees. Only set for things with
   * a real extent — an individual star leaves the current field alone.
   */
  fov?: number;
  /**
   * Lowercased searchable words. Every query token must be a PREFIX of one of
   * them — see `matches` for why substring matching is not good enough.
   */
  words: string[];
  /** Tiebreak within a kind. Lower sorts first; stars use magnitude. */
  rank: number;
}

/**
 * Bayer letters as people type them.
 *
 * The catalogue stores the Greek glyph, and almost nobody types `α`. Without
 * this table `alpha ori` finds nothing, which is the single most likely thing
 * anyone will try.
 */
const GREEK_NAMES: Record<string, string> = {
  α: 'alpha alp a',
  β: 'beta bet b',
  γ: 'gamma gam g',
  δ: 'delta del d',
  ε: 'epsilon eps e',
  ζ: 'zeta zet z',
  η: 'eta h',
  θ: 'theta the th',
  ι: 'iota iot i',
  κ: 'kappa kap k',
  λ: 'lambda lam l',
  μ: 'mu m',
  ν: 'nu n',
  ξ: 'xi x',
  ο: 'omicron omi o',
  π: 'pi p',
  ρ: 'rho r',
  σ: 'sigma sig s',
  τ: 'tau t',
  υ: 'upsilon ups u',
  φ: 'phi phi f',
  χ: 'chi c',
  ψ: 'psi y',
  ω: 'omega ome w',
};

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

interface Extent {
  ra: number;
  dec: number;
  /** Greatest angular distance from the centroid, in degrees. */
  radius: number;
}

/**
 * Centroid and angular radius of a set of sky positions.
 *
 * Averaging unit vectors rather than averaging RA and Dec directly: the naive
 * version breaks across 0h and near the poles, which is exactly where several
 * of the figures live (Ursa Minor wraps the pole; Pisces and Andromeda cross
 * the RA seam). Radius is measured from the resulting centroid, so this stays
 * linear in the vertex count instead of comparing every pair.
 */
function extentOf(coords: number[][]): Extent | null {
  let x = 0;
  let y = 0;
  let z = 0;
  let n = 0;

  for (const flat of coords) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const ra = flat[i] * D2R;
      const dec = flat[i + 1] * D2R;
      const cd = Math.cos(dec);
      x += cd * Math.cos(ra);
      y += cd * Math.sin(ra);
      z += Math.sin(dec);
      n++;
    }
  }
  if (n === 0) return null;

  const len = Math.hypot(x, y, z);
  // Degenerate only if the vertices cancel out, which needs a figure spread
  // over the whole sphere. Nothing in the IAU set does, but guard anyway.
  if (len < 1e-9) return null;
  x /= len;
  y /= len;
  z /= len;

  let maxSep = 0;
  for (const flat of coords) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const ra = flat[i] * D2R;
      const dec = flat[i + 1] * D2R;
      const cd = Math.cos(dec);
      const dot = x * cd * Math.cos(ra) + y * cd * Math.sin(ra) + z * Math.sin(dec);
      const sep = Math.acos(Math.min(1, Math.max(-1, dot)));
      if (sep > maxSep) maxSep = sep;
    }
  }

  let ra = Math.atan2(y, x) * R2D;
  if (ra < 0) ra += 360;
  return { ra, dec: Math.asin(Math.min(1, Math.max(-1, z))) * R2D, radius: maxSep * R2D };
}

/** Lowercase, split on anything that is not a letter or digit, drop empties. */
function toWords(...parts: (string | undefined)[]): string[] {
  const out = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    for (const w of p.toLowerCase().split(/[^\p{L}\p{N}]+/u)) if (w) out.add(w);
  }
  return [...out];
}

/**
 * Does every query token prefix some word of the target?
 *
 * Prefix-of-a-word, never substring-anywhere. Substring matching looks fine
 * until you try the two most natural queries there are: `alpha ori` matched
 * Sirius, because `ori` sits inside "Canis Major(is)", and `eta tau` matched
 * Hadar, because `eta` sits inside "beta" and `tau` inside "Centauri". Anchoring
 * to word starts kills both without costing any real match.
 */
function matches(words: string[], tokens: string[]): boolean {
  return tokens.every((tok) => words.some((w) => w.startsWith(tok)));
}

let index: SkyTarget[] | null = null;

function build(): SkyTarget[] {
  const targets: SkyTarget[] = [];

  // Genitives keyed by the constellation abbreviation, so `α Ori` can be shown
  // and searched as `α Orionis`.
  const genitive = new Map<string, string>();
  for (const c of CONSTELLATIONS) if (!genitive.has(c.desig)) genitive.set(c.desig, c.gen);

  // --- stars ---
  for (const idx of namedStarIndices()) {
    const n = starName(idx);
    const p = starPoint(idx);
    if (!n || !p) continue;

    const gen = n.con ? (genitive.get(n.con) ?? n.con) : '';
    const bayerFull = n.bayer && gen ? `${n.bayer} ${gen}` : '';
    const flamFull = n.flam && gen ? `${n.flam} ${gen}` : '';

    const label = n.proper ? n.proper.toUpperCase() : bayerFull || flamFull || `HD ${n.hd}`;
    const detailParts: string[] = [];
    if (n.proper && bayerFull) detailParts.push(bayerFull);
    else if (n.proper && flamFull) detailParts.push(flamFull);
    else if (!n.proper && n.hd) detailParts.push(`HD ${n.hd}`);
    detailParts.push(`mag ${p.mag >= 0 ? '+' : '−'}${Math.abs(p.mag).toFixed(2)}`);

    const alias = n.bayer ? (GREEK_NAMES[n.bayer] ?? '') : '';
    targets.push({
      kind: 'star',
      label,
      detail: detailParts.join(' · '),
      ra: p.ra,
      dec: p.dec,
      // The bare 'hd' has to be its own word or `hd 39801` finds nothing: the
      // catalogue stores only the digits.
      words: toWords(n.proper, n.bayer, alias, n.flam, n.con, gen, n.hd, n.hd && 'hd'),
      rank: p.mag,
    });
  }

  // --- constellations ---
  // Keyed by array position, never by `id`: the source ships TWO records with
  // id 'Ser' (the two halves of Serpens, both labelled SERPENS CAUDA), and a
  // Map keyed on id would silently drop one of them.
  for (const c of CONSTELLATIONS) {
    const ext = extentOf(c.paths);
    targets.push({
      kind: 'constellation',
      label: c.name,
      detail: ext ? `${c.desig} · ${(ext.radius * 2).toFixed(0)}° across` : c.desig,
      // The centroid frames better than the hand-placed label anchor, which is
      // positioned for where the NAME should sit, not where the figure is.
      ra: ext ? ext.ra : c.ra,
      dec: ext ? ext.dec : c.dec,
      fov: ext ? Math.min(130, Math.max(8, ext.radius * 2.5)) : undefined,
      words: toWords(c.name, c.desig, c.gen),
      rank: c.rank,
    });
  }

  // --- named regions ---
  // Several regions share a name with a constellation (Orion, Andromeda,
  // Scorpius, Cassiopeia, Ursa Major). Two identical-looking rows that do
  // almost the same thing is just noise, so the constellation wins: its centre
  // and field come from the figure's real geometry rather than a hand-typed
  // approximation.
  const conLabels = new Set(
    targets.filter((t) => t.kind === 'constellation').map((t) => t.label),
  );
  for (const r of SKY_REGIONS) {
    if (conLabels.has(r.name.toUpperCase())) continue;
    targets.push({
      kind: 'region',
      label: r.name.toUpperCase(),
      detail: `region · ${r.fov}° field`,
      ra: r.ra,
      dec: r.dec,
      fov: r.fov,
      words: toWords(r.name),
      rank: 0,
    });
  }

  index = targets;
  return targets;
}

/** Kind priority when scores are otherwise equal. Regions are curated, so first. */
const KIND_ORDER: Record<SkyTargetKind, number> = { region: 0, constellation: 1, star: 2 };

export function searchSky(query: string, limit = 8): SkyTarget[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const all = index ?? build();
  const hits: { t: SkyTarget; exact: number }[] = [];

  for (const t of all) {
    if (!matches(t.words, tokens)) continue;
    const label = t.label.toLowerCase();
    // Whole-label match beats a prefix, which beats a match on any other word
    // — otherwise typing `ori` surfaces a hundred faint Orionis members ahead
    // of Orion itself.
    const exact = label === q ? 0 : label.startsWith(q) ? 1 : 2;
    hits.push({ t, exact });
  }

  hits.sort(
    (a, b) =>
      a.exact - b.exact ||
      KIND_ORDER[a.t.kind] - KIND_ORDER[b.t.kind] ||
      a.t.rank - b.t.rank ||
      a.t.label.localeCompare(b.t.label),
  );

  return hits.slice(0, limit).map((h) => h.t);
}
