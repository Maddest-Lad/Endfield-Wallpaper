import { createRng } from '@core/utils/random';
import type { StarchartConfig } from './config';
import { getPalette, type Palette } from './palette';
import { createHazeField, type HazeField } from './field';
import { buildCatalog, type Star } from './catalog';
import { delaunayEdges, mstFromEdges, mstComplete, farthestPoints, type Edge } from './graph';
import { detailScale } from './layout';

export interface Constellation {
  stars: Star[];
  edges: Edge[];
}

export interface RouteNode {
  x: number;
  y: number;
  /** Hub nodes get a heavier terminal marker. */
  hub: boolean;
}

export interface RouteEdge {
  a: number;
  b: number;
  dashed: boolean;
  /** Backbone edges are the MST; the rest are redundancy kept by the prune. */
  backbone: boolean;
}

export interface StarchartData {
  palette: Palette;
  haze: HazeField;
  stars: Star[];
  beacons: Star[];
  constellations: Constellation[];
  routeNodes: RouteNode[];
  routeEdges: RouteEdge[];
  /** Identity of the star catalogue + haze field, for layer cache keys. */
  catalogKey: string;
  /** Identity of the derived networks. */
  graphKey: string;
}

interface CatalogLevel {
  haze: HazeField;
  stars: Star[];
  beacons: Star[];
}

interface GraphLevel {
  constellations: Constellation[];
  routeNodes: RouteNode[];
  routeEdges: RouteEdge[];
}

// Two-level memo, mirroring endfield: nudging constellationCount or routeDensity
// reuses the (much more expensive) catalogue and only re-runs the graph work.
let catalogKeyCache = '';
let catalogCache: CatalogLevel | null = null;
let graphKeyCache = '';
let graphCache: GraphLevel | null = null;

function buildConstellations(
  seed: string,
  stars: Star[],
  count: number,
  width: number,
  height: number,
): Constellation[] {
  if (count <= 0) return [];

  const rng = createRng(`${seed}_figures`);
  const s = detailScale(width, height);
  // Down to magnitude 3: the mag<=2 population alone averages further apart than
  // the linking radius below, so a brighter pool cannot form compact figures at
  // all — it can only form sprawling ones.
  const pool = stars.filter((st) => st.mag <= 3);
  if (pool.length < 6) return [];

  const short = Math.min(width, height);
  // A real constellation is a LOCAL group. These three bounds are what keep a
  // figure compact instead of letting the MST rope together stars on opposite
  // edges of the plate:
  const linkRadius = short * 0.075; // how far from its anchor a member may sit
  const maxSpan = short * 0.16; // cap on the figure's bounding box
  const maxEdge = short * 0.085; // longest segment the figure may contain
  const minEdge = 13 * s; // below this an edge reads as a smudge, not a line

  // Oversample anchors: a candidate can fail the bounds above, and we would
  // rather try another site than return fewer figures than asked for.
  const anchors = farthestPoints(pool, count * 3, Math.floor(rng() * pool.length));
  const used = new Set<number>();
  const out: Constellation[] = [];

  for (const anchorIdx of anchors) {
    if (out.length >= count) break;
    if (used.has(anchorIdx)) continue;
    const anchor = pool[anchorIdx];

    const candidates: { idx: number; d: number }[] = [];
    for (let i = 0; i < pool.length; i++) {
      if (i === anchorIdx || used.has(i)) continue;
      const d = Math.hypot(pool[i].x - anchor.x, pool[i].y - anchor.y);
      if (d < linkRadius && d > minEdge) candidates.push({ idx: i, d });
    }
    if (candidates.length < 2) continue;
    candidates.sort((p, q) => p.d - q.d);

    const want = 2 + Math.floor(rng() * 5);
    const members: Star[] = [anchor];
    const taken: number[] = [anchorIdx];
    let minX = anchor.x;
    let maxX = anchor.x;
    let minY = anchor.y;
    let maxY = anchor.y;

    for (const c of candidates) {
      if (members.length > want) break;
      // Skip some near neighbours so figures do not collapse into tight blobs.
      if (rng() < 0.25) continue;
      const p = pool[c.idx];
      const nMinX = Math.min(minX, p.x);
      const nMaxX = Math.max(maxX, p.x);
      const nMinY = Math.min(minY, p.y);
      const nMaxY = Math.max(maxY, p.y);
      if (nMaxX - nMinX > maxSpan || nMaxY - nMinY > maxSpan) continue;
      minX = nMinX;
      maxX = nMaxX;
      minY = nMinY;
      maxY = nMaxY;
      members.push(p);
      taken.push(c.idx);
    }

    if (members.length < 3) continue;

    // Prune the tree AFTER building it: an MST over a compact cluster can still
    // contain one long spanning edge across a gap in the middle.
    const edges = mstComplete(members).filter(([a, b]) => {
      const d = Math.hypot(members[a].x - members[b].x, members[a].y - members[b].y);
      return d <= maxEdge;
    });
    if (edges.length < 2) continue;

    for (const t of taken) used.add(t);
    out.push({ stars: members, edges });
  }

  return out;
}

function buildRoutes(
  seed: string,
  stars: Star[],
  beacons: Star[],
  density: number,
  width: number,
  height: number,
): { nodes: RouteNode[]; edges: RouteEdge[] } {
  const rng = createRng(`${seed}_lanes`);
  const pool = beacons.length >= 8 ? beacons : stars.filter((st) => st.mag <= 1);
  if (pool.length < 4) return { nodes: [], edges: [] };

  const wanted = Math.round(9 + density * 19);
  const picks = farthestPoints(pool, wanted, Math.floor(rng() * pool.length));
  const nodes: RouteNode[] = picks.map((i) => ({
    x: pool[i].x,
    y: pool[i].y,
    hub: rng() < 0.3,
  }));
  if (nodes.length < 3) return { nodes, edges: [] };

  const all = delaunayEdges(nodes);
  const backbone = mstFromEdges(nodes, all);
  const backboneSet = new Set(backbone.map(([a, b]) => (a < b ? `${a}:${b}` : `${b}:${a}`)));

  const diag = Math.hypot(width, height);
  const maxExtra = diag * (0.16 + density * 0.16);

  const edges: RouteEdge[] = backbone.map(([a, b]) => ({
    a,
    b,
    dashed: rng() < 0.34,
    backbone: true,
  }));

  for (const [a, b] of all) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (backboneSet.has(key)) continue;
    const len = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
    if (len > maxExtra) continue;
    if (rng() > density * 0.55) continue;
    edges.push({ a, b, dashed: rng() < 0.6, backbone: false });
  }

  return { nodes, edges };
}

export function deriveStarchart(
  config: StarchartConfig,
  width: number,
  height: number,
): StarchartData {
  const catalogKey = `${config.seed}|${width}|${height}|${config.starDensity}|${config.hazeCurve}|${config.spectralTint}`;

  let level1: CatalogLevel;
  if (catalogKey === catalogKeyCache && catalogCache) {
    level1 = catalogCache;
  } else {
    const haze = createHazeField(config.seed, width, height, config.hazeCurve);
    const { stars, beacons } = buildCatalog(
      config.seed,
      width,
      height,
      config.starDensity,
      config.spectralTint,
      haze,
    );
    level1 = { haze, stars, beacons };
    catalogKeyCache = catalogKey;
    catalogCache = level1;
    graphKeyCache = '';
    graphCache = null;
  }

  const graphKey = `${catalogKey}|${config.constellationCount}|${config.routeDensity}`;

  let level2: GraphLevel;
  if (graphKey === graphKeyCache && graphCache) {
    level2 = graphCache;
  } else {
    const routes = buildRoutes(
      config.seed,
      level1.stars,
      level1.beacons,
      config.routeDensity,
      width,
      height,
    );
    level2 = {
      constellations: buildConstellations(
        config.seed,
        level1.stars,
        config.constellationCount,
        width,
        height,
      ),
      routeNodes: routes.nodes,
      routeEdges: routes.edges,
    };
    graphKeyCache = graphKey;
    graphCache = level2;
  }

  return {
    palette: getPalette(config.theme, config.accentColor),
    haze: level1.haze,
    stars: level1.stars,
    beacons: level1.beacons,
    constellations: level2.constellations,
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
