import { Delaunay } from 'd3-delaunay';

export interface Pt {
  x: number;
  y: number;
}

export type Edge = [number, number];

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Every edge of the Delaunay triangulation, deduplicated, hull edges included.
 *
 * The usual `if (halfedges[i] < i) continue` idiom silently drops the hull, since
 * a hull halfedge is -1; the extra `!== -1` test is what keeps the outer ring.
 */
export function delaunayEdges(pts: Pt[]): Edge[] {
  if (pts.length < 3) {
    return pts.length === 2 ? [[0, 1]] : [];
  }
  const d = Delaunay.from(
    pts,
    (p) => p.x,
    (p) => p.y,
  );
  const { halfedges, triangles } = d;
  const edges: Edge[] = [];
  for (let i = 0; i < halfedges.length; i++) {
    const j = halfedges[i];
    if (j !== -1 && j < i) continue;
    const a = triangles[i];
    const b = triangles[i % 3 === 2 ? i - 2 : i + 1];
    if (a !== b) edges.push([a, b]);
  }
  return edges;
}

/** Prim's over an explicit edge set. Assumes the edge set is connected. */
export function mstFromEdges(pts: Pt[], edges: Edge[]): Edge[] {
  const n = pts.length;
  if (n < 2) return [];

  const adj: Edge[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push([b, dist(pts[a], pts[b])]);
    adj[b].push([a, dist(pts[a], pts[b])]);
  }

  const inTree = new Array<boolean>(n).fill(false);
  const best = new Array<number>(n).fill(Infinity);
  const from = new Array<number>(n).fill(-1);
  best[0] = 0;

  const result: Edge[] = [];
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    let bestVal = Infinity;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && best[i] < bestVal) {
        bestVal = best[i];
        u = i;
      }
    }
    if (u === -1) break;
    inTree[u] = true;
    if (from[u] !== -1) result.push([from[u], u]);
    for (const [v, w] of adj[u]) {
      if (!inTree[v] && w < best[v]) {
        best[v] = w;
        from[v] = u;
      }
    }
  }
  return result;
}

/** Prim's over the complete graph. Only for the small constellation clusters. */
export function mstComplete(pts: Pt[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) edges.push([i, j]);
  }
  return mstFromEdges(pts, edges);
}

/**
 * Farthest-point sampling: pick `count` indices that are spread across the plate
 * rather than clumped. Random picks give clusters that overlap; this does not.
 */
export function farthestPoints<T extends Pt>(items: T[], count: number, startIdx: number): number[] {
  if (items.length === 0 || count <= 0) return [];
  const picked = [Math.min(startIdx, items.length - 1)];
  const near = items.map((p) => dist(p, items[picked[0]]));

  while (picked.length < Math.min(count, items.length)) {
    let bestIdx = -1;
    let bestVal = -1;
    for (let i = 0; i < items.length; i++) {
      if (near[i] > bestVal) {
        bestVal = near[i];
        bestIdx = i;
      }
    }
    if (bestIdx === -1 || bestVal <= 0) break;
    picked.push(bestIdx);
    for (let i = 0; i < items.length; i++) {
      const d = dist(items[i], items[bestIdx]);
      if (d < near[i]) near[i] = d;
    }
  }
  return picked;
}
