import { createRng } from '@core/utils/random';
import type { StarchartConfig } from './config';
import { getPalette, type Palette } from './palette';
import { createHazeField, type HazeField } from './field';
import { buildCatalog, type Star } from './catalog';
import { delaunayEdges, mstFromEdges, farthestPoints, type Edge } from './graph';
import { createSkyView, type SkyView } from './sky';
import { CONSTELLATIONS } from './data/constellations.gen';

/** A projected constellation figure: real IAU line-work, clipped to the plate. */
export interface Figure {
  id: string;
  name: string;
  gen: string;
  /** Polylines in plate pixels. Already split where the projection clipped. */
  paths: [number, number][][];
  /** Label anchor in plate pixels, or null when it fell off the plate. */
  label: [number, number] | null;
  /** How much of the figure is actually on the plate, 0..1. */
  coverage: number;
}

export interface RouteNode {
  x: number;
  y: number;
  /** The real star this node was pinned to. */
  star: Star;
  hub: boolean;
}

export interface RouteEdge {
  a: number;
  b: number;
  dashed: boolean;
  backbone: boolean;
}

export interface StarchartData {
  palette: Palette;
  view: SkyView;
  haze: HazeField;
  stars: Star[];
  beacons: Star[];
  figures: Figure[];
  routeNodes: RouteNode[];
  routeEdges: RouteEdge[];
  /** How many catalogue entries passed the magnitude cut. */
  surveyed: number;
  /** Nearest projected star to a plate point, for line-work that must clear it. */
  starAt: (x: number, y: number, radius: number) => Star | null;
  /** Identity of the projected catalogue + haze, for layer cache keys. */
  catalogKey: string;
  /** Identity of the derived networks. */
  graphKey: string;
}

interface CatalogLevel {
  view: SkyView;
  stars: Star[];
  beacons: Star[];
  figures: Figure[];
  surveyed: number;
  starAt: StarchartData['starAt'];
}

interface GraphLevel {
  routeNodes: RouteNode[];
  routeEdges: RouteEdge[];
}

// Two-level memo, mirroring endfield: nudging routeDensity reuses the (much more
// expensive) projection pass and only re-runs the graph work.
let catalogKeyCache = '';
let catalogCache: CatalogLevel | null = null;
let graphKeyCache = '';
let graphCache: GraphLevel | null = null;

/**
 * Uniform grid over the plate, so constellation line-work can find the star at
 * each of its endpoints without a scan over every star in the field.
 */
function buildStarIndex(
  stars: Star[],
  width: number,
  height: number,
): StarchartData['starAt'] {
  const cell = 24;
  const cols = Math.max(1, Math.ceil(width / cell));
  const rows = Math.max(1, Math.ceil(height / cell));
  const buckets = new Map<number, Star[]>();

  for (const st of stars) {
    const cx = Math.min(cols - 1, Math.max(0, Math.floor(st.x / cell)));
    const cy = Math.min(rows - 1, Math.max(0, Math.floor(st.y / cell)));
    const key = cy * cols + cx;
    const b = buckets.get(key);
    if (b) b.push(st);
    else buckets.set(key, [st]);
  }

  return (x, y, radius) => {
    const r = Math.min(radius, cell);
    const x0 = Math.max(0, Math.floor((x - r) / cell));
    const x1 = Math.min(cols - 1, Math.floor((x + r) / cell));
    const y0 = Math.max(0, Math.floor((y - r) / cell));
    const y1 = Math.min(rows - 1, Math.floor((y + r) / cell));

    let best: Star | null = null;
    let bestD = radius * radius;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const b = buckets.get(cy * cols + cx);
        if (!b) continue;
        for (const st of b) {
          const d = (st.x - x) ** 2 + (st.y - y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = st;
          }
        }
      }
    }
    return best;
  };
}

/**
 * Project the IAU figures.
 *
 * A polyline is broken wherever the projection drops a vertex, which is what
 * happens when a figure runs off the far side of the sphere. Without the break,
 * the two surviving halves would be joined by a line straight across the plate.
 */
function buildFigures(view: SkyView, width: number, height: number): Figure[] {
  const pad = Math.max(width, height) * 0.25;
  const out: Figure[] = [];

  for (const c of CONSTELLATIONS) {
    const paths: [number, number][][] = [];
    let onPlate = 0;
    let total = 0;
    let run: [number, number][] = [];

    for (const flat of c.paths) {
      for (let i = 0; i < flat.length; i += 2) {
        total++;
        const q = view.project(flat[i], flat[i + 1]);
        if (!q || q[0] < -pad || q[0] > width + pad || q[1] < -pad || q[1] > height + pad) {
          if (run.length > 1) paths.push(run);
          run = [];
          continue;
        }
        if (q[0] >= 0 && q[0] <= width && q[1] >= 0 && q[1] <= height) onPlate++;
        run.push(q);
      }
      if (run.length > 1) paths.push(run);
      run = [];
    }

    if (paths.length === 0) continue;

    const lp = view.project(c.ra, c.dec);
    const label =
      lp && lp[0] >= 0 && lp[0] <= width && lp[1] >= 0 && lp[1] <= height ? lp : null;

    out.push({
      id: c.id,
      name: c.name,
      gen: c.gen,
      paths,
      label,
      coverage: total > 0 ? onPlate / total : 0,
    });
  }

  // Most on-plate first: the label and callout layers take a prefix of this.
  out.sort((a, b) => b.coverage - a.coverage);
  return out;
}

/**
 * The one deliberately fictional network on the plate.
 *
 * Its nodes are pinned to real bright stars, so the lanes connect places that
 * exist even though the lanes themselves do not — which is the whole conceit,
 * and it is also why they are the only thing drawn in the accent colour.
 */
function buildRoutes(
  seed: string,
  stars: Star[],
  beacons: Star[],
  density: number,
  width: number,
  height: number,
): GraphLevel {
  const rng = createRng(`${seed}_lanes`);
  const pool = beacons.length >= 8 ? beacons : stars.slice(0, 90);
  if (pool.length < 4) return { routeNodes: [], routeEdges: [] };

  const wanted = Math.round(9 + density * 19);
  const picks = farthestPoints(pool, wanted, Math.floor(rng() * pool.length));
  const routeNodes: RouteNode[] = picks.map((i) => ({
    x: pool[i].x,
    y: pool[i].y,
    star: pool[i],
    hub: rng() < 0.3,
  }));
  if (routeNodes.length < 3) return { routeNodes, routeEdges: [] };

  const all = delaunayEdges(routeNodes);
  const backbone = mstFromEdges(routeNodes, all);
  const backboneSet = new Set(backbone.map(([a, b]) => (a < b ? `${a}:${b}` : `${b}:${a}`)));

  const diag = Math.hypot(width, height);
  const maxExtra = diag * (0.16 + density * 0.16);

  const routeEdges: RouteEdge[] = backbone.map(([a, b]: Edge) => ({
    a,
    b,
    dashed: rng() < 0.34,
    backbone: true,
  }));

  for (const [a, b] of all) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (backboneSet.has(key)) continue;
    const len = Math.hypot(
      routeNodes[a].x - routeNodes[b].x,
      routeNodes[a].y - routeNodes[b].y,
    );
    if (len > maxExtra) continue;
    if (rng() > density * 0.55) continue;
    routeEdges.push({ a, b, dashed: rng() < 0.6, backbone: false });
  }

  return { routeNodes, routeEdges };
}

export function deriveStarchart(
  config: StarchartConfig,
  width: number,
  height: number,
): StarchartData {
  // Everything the projection or the magnitude cut depends on. The seed is NOT
  // in here: the sky is real, so it does not reshuffle when the seed is rerolled.
  const catalogKey =
    `${width}|${height}|${config.projection}|${config.raCenter}|${config.decCenter}` +
    `|${config.roll}|${config.fieldOfView}|${config.limitingMag}|${config.spectralTint}`;

  let level1: CatalogLevel;
  if (catalogKey === catalogKeyCache && catalogCache) {
    level1 = catalogCache;
  } else {
    const view = createSkyView(
      config.projection,
      config.raCenter,
      config.decCenter,
      config.roll,
      config.fieldOfView,
      width,
      height,
    );
    const { stars, beacons, surveyed } = buildCatalog(
      view,
      config.limitingMag,
      width,
      height,
    );
    level1 = {
      view,
      stars,
      beacons,
      surveyed,
      figures: buildFigures(view, width, height),
      starAt: buildStarIndex(stars, width, height),
    };
    catalogKeyCache = catalogKey;
    catalogCache = level1;
    graphKeyCache = '';
    graphCache = null;
  }

  const graphKey = `${catalogKey}|${config.seed}|${config.routeDensity}`;

  let level2: GraphLevel;
  if (graphKey === graphKeyCache && graphCache) {
    level2 = graphCache;
  } else {
    level2 = buildRoutes(
      config.seed,
      level1.stars,
      level1.beacons,
      config.routeDensity,
      width,
      height,
    );
    graphKeyCache = graphKey;
    graphCache = level2;
  }

  return {
    palette: getPalette(config.theme, config.accentColor),
    view: level1.view,
    // Cheap to rebuild and it is the one part of the field the seed still
    // controls, so it sits outside the projection memo rather than pinning the
    // seed into a cache key that a seed reroll would then have to invalidate.
    haze: createHazeField(config.seed, level1.view),
    stars: level1.stars,
    beacons: level1.beacons,
    figures: level1.figures,
    surveyed: level1.surveyed,
    starAt: level1.starAt,
    routeNodes: level2.routeNodes,
    routeEdges: level2.routeEdges,
    catalogKey,
    graphKey,
  };
}

export function clearStarchartMemo(): void {
  catalogKeyCache = '';
  catalogCache = null;
  graphKeyCache = '';
  graphCache = null;
}
