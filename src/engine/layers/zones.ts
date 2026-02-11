import { Delaunay } from 'd3-delaunay';
import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange, randomInt } from '../../utils/random';
import { EN_LABELS } from '../../data/textContent';

/** Union-Find for merging Voronoi cells into territory regions. */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
  }
}

interface Region {
  cells: number[];
  centroid: [number, number];
  area: number;
}

interface Extremum {
  x: number;
  y: number;
  value: number;
}

/** Scan heightmap for local maxima and minima (8-neighbor comparison). */
function findExtrema(
  heightmap: Float64Array,
  gridWidth: number,
  gridHeight: number,
): { maxima: Extremum[]; minima: Extremum[] } {
  const maxima: Extremum[] = [];
  const minima: Extremum[] = [];

  for (let y = 1; y < gridHeight - 1; y++) {
    for (let x = 1; x < gridWidth - 1; x++) {
      const val = heightmap[y * gridWidth + x];
      let isMax = true;
      let isMin = true;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const neighbor = heightmap[(y + dy) * gridWidth + (x + dx)];
          if (neighbor > val) isMax = false;
          if (neighbor < val) isMin = false;
        }
      }

      if (isMax) maxima.push({ x, y, value: val });
      if (isMin) minima.push({ x, y, value: val });
    }
  }

  return { maxima, minima };
}

/** Greedy farthest-point selection for spatially well-distributed subsampling. */
function subsampleExtrema(
  extrema: Extremum[],
  targetCount: number,
  rng: () => number,
): Extremum[] {
  if (extrema.length <= targetCount) return extrema;

  // Shuffle for deterministic tie-breaking
  const shuffled = [...extrema];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected: Extremum[] = [shuffled[0]];
  const used = new Set<number>([0]);

  while (selected.length < targetCount) {
    let bestDist = -1;
    let bestIdx = -1;

    for (let i = 0; i < shuffled.length; i++) {
      if (used.has(i)) continue;
      let minDist = Infinity;
      for (const s of selected) {
        const dx = shuffled[i].x - s.x;
        const dy = shuffled[i].y - s.y;
        const d = dx * dx + dy * dy;
        if (d < minDist) minDist = d;
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;
    selected.push(shuffled[bestIdx]);
    used.add(bestIdx);
  }

  return selected;
}

/** Assign a heightmap value to a contour-aligned band. */
function getBand(hVal: number, bandEdges: number[]): number {
  for (let b = 0; b < bandEdges.length; b++) {
    if (hVal < bandEdges[b]) return b;
  }
  return bandEdges.length;
}

/** Compute steepness (gradient magnitude) between two heightmap grid cells. */
function heightmapGradient(
  heightmap: Float64Array,
  gridWidth: number,
  gx1: number,
  gy1: number,
  gx2: number,
  gy2: number,
): number {
  const h1 = heightmap[gy1 * gridWidth + gx1];
  const h2 = heightmap[gy2 * gridWidth + gx2];
  const dx = gx2 - gx1;
  const dy = gy2 - gy1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return 0;
  return Math.abs(h2 - h1) / dist;
}

export function drawZones(rc: RenderContext): void {
  const { ctx, width, height, rng, palette, heightmap, gridWidth, gridHeight, contourData } = rc;

  // --- Step 1: Terrain-biased seed point placement ---
  const totalPoints = randomInt(rng, 25, 40);
  const points: [number, number][] = [];

  const { maxima, minima } = findExtrema(heightmap, gridWidth, gridHeight);
  const allExtrema = [...maxima, ...minima];

  const terrainPointTarget = Math.round(totalPoints * 0.6);
  const terrainPointCount = Math.min(terrainPointTarget, allExtrema.length);
  const randomPointCount = totalPoints - terrainPointCount;

  const scaleX = width / gridWidth;
  const scaleY = height / gridHeight;
  const jitterRadius = Math.min(width, height) * 0.015;

  // Place seed points at detected terrain extrema (peaks + valleys)
  const selectedExtrema = subsampleExtrema(allExtrema, terrainPointCount, rng);
  for (const ext of selectedExtrema) {
    const cx = Math.max(width * 0.02, Math.min(width * 0.98,
      ext.x * scaleX + randomInRange(rng, -jitterRadius, jitterRadius)));
    const cy = Math.max(height * 0.02, Math.min(height * 0.98,
      ext.y * scaleY + randomInRange(rng, -jitterRadius, jitterRadius)));
    points.push([cx, cy]);
  }

  // Fill remaining points randomly for coverage in flat areas
  for (let i = 0; i < randomPointCount; i++) {
    points.push([
      randomInRange(rng, width * 0.02, width * 0.98),
      randomInRange(rng, height * 0.02, height * 0.98),
    ]);
  }

  const pointCount = points.length;

  // --- Step 2: Voronoi tessellation ---
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  // --- Step 3: Contour-threshold-aligned banding ---
  const thresholds = contourData.map((c) => c.value);
  const desiredBands = randomInt(rng, 5, 8);
  const step = Math.max(1, Math.floor(thresholds.length / desiredBands));
  const bandEdges: number[] = [];
  for (let i = step; i < thresholds.length; i += step) {
    bandEdges.push(thresholds[i]);
  }

  // Precompute grid coordinates and bands for each point
  const gridCoords: [number, number][] = points.map(([px, py]) => [
    Math.min(gridWidth - 1, Math.max(0, Math.floor(px * gridWidth / width))),
    Math.min(gridHeight - 1, Math.max(0, Math.floor(py * gridHeight / height))),
  ]);

  const bands: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const poly = voronoi.cellPolygon(i);
    if (!poly) {
      bands.push(-1);
      continue;
    }
    const [gx, gy] = gridCoords[i];
    const hVal = heightmap[gy * gridWidth + gx];
    bands.push(getBand(hVal, bandEdges));
  }

  // --- Step 4: Gradient-aware merge using delaunay.neighbors() ---
  const uf = new UnionFind(pointCount);

  // Compute adaptive gradient threshold (75th percentile of all neighbor-pair gradients)
  const allGradients: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    if (bands[i] === -1) continue;
    for (const j of delaunay.neighbors(i)) {
      if (j >= pointCount || bands[j] === -1 || j <= i) continue;
      allGradients.push(heightmapGradient(
        heightmap, gridWidth,
        gridCoords[i][0], gridCoords[i][1],
        gridCoords[j][0], gridCoords[j][1],
      ));
    }
  }
  allGradients.sort((a, b) => a - b);
  const gradientThreshold = allGradients.length > 0
    ? allGradients[Math.floor(allGradients.length * 0.75)]
    : Infinity;

  // Merge adjacent cells in same band, respecting gradient constraint
  for (let i = 0; i < pointCount; i++) {
    if (bands[i] === -1) continue;
    for (const j of delaunay.neighbors(i)) {
      if (j >= pointCount || bands[j] === -1) continue;
      if (bands[i] !== bands[j]) continue;

      const grad = heightmapGradient(
        heightmap, gridWidth,
        gridCoords[i][0], gridCoords[i][1],
        gridCoords[j][0], gridCoords[j][1],
      );
      if (grad > gradientThreshold) continue;

      uf.union(i, j);
    }
  }

  // --- Steps 5-9: Region building, selection, and rendering (unchanged) ---

  // 5. Group cells into regions
  const regionMap = new Map<number, number[]>();
  for (let i = 0; i < pointCount; i++) {
    if (bands[i] === -1) continue;
    const root = uf.find(i);
    if (!regionMap.has(root)) {
      regionMap.set(root, []);
    }
    regionMap.get(root)!.push(i);
  }

  // 6. Build region objects with centroids and areas
  const regions: Region[] = [];
  for (const [, cells] of regionMap) {
    if (cells.length < 2) continue;

    let totalArea = 0;
    let cx = 0;
    let cy = 0;

    for (const cellIdx of cells) {
      const poly = voronoi.cellPolygon(cellIdx);
      if (!poly) continue;
      const area = polygonArea(poly);
      totalArea += area;
      cx += points[cellIdx][0] * area;
      cy += points[cellIdx][1] * area;
    }

    if (totalArea > 0) {
      cx /= totalArea;
      cy /= totalArea;
    }

    regions.push({ cells, centroid: [cx, cy], area: totalArea });
  }

  // Sort by area descending
  regions.sort((a, b) => b.area - a.area);

  // 7. Select 3-5 regions, skipping those too close to center
  const centerX = width / 2;
  const centerY = height / 2;
  const centerThreshold = Math.min(width, height) * 0.15;

  const candidates = regions.filter((r) => {
    const dx = r.centroid[0] - centerX;
    const dy = r.centroid[1] - centerY;
    return Math.hypot(dx, dy) > centerThreshold;
  });

  // Greedy selection: pick zones that don't share any Voronoi edges
  const targetZoneCount = randomInt(rng, 3, 5);
  const selectedZones: Region[] = [];
  const usedCells = new Set<number>();       // cells in selected zones
  const adjacentCells = new Set<number>();   // Delaunay neighbors of used cells

  for (const candidate of candidates) {
    if (selectedZones.length >= targetZoneCount) break;

    // Check if any cell in this candidate is used or adjacent to a selected zone
    const overlaps = candidate.cells.some((c) => usedCells.has(c) || adjacentCells.has(c));
    if (overlaps) continue;

    selectedZones.push(candidate);

    // Mark this region's cells and their neighbors as occupied
    for (const c of candidate.cells) {
      usedCells.add(c);
      for (const n of delaunay.neighbors(c)) {
        if (!usedCells.has(n)) adjacentCells.add(n);
      }
    }
  }

  const zoneCount = selectedZones.length;

  // 8. Pick 1-2 zones to highlight with accent border
  const highlightCount = Math.min(randomInt(rng, 1, 2), zoneCount);
  const highlightIndices = new Set<number>();
  while (highlightIndices.size < highlightCount) {
    highlightIndices.add(Math.floor(rng() * zoneCount));
  }

  // Shuffle labels for zone naming
  const labelPool = [...EN_LABELS];
  for (let i = 0; i < Math.min(zoneCount, labelPool.length); i++) {
    const j = i + Math.floor(rng() * (labelPool.length - i));
    [labelPool[i], labelPool[j]] = [labelPool[j], labelPool[i]];
  }

  // 9. Render each selected zone
  const lineSpacing = Math.max(3, Math.round(width / 300));

  for (let zi = 0; zi < selectedZones.length; zi++) {
    const zone = selectedZones[zi];
    const isHighlight = highlightIndices.has(zi);

    ctx.save();

    // Build a combined path from all cells in this region
    ctx.beginPath();
    for (const cellIdx of zone.cells) {
      const poly = voronoi.cellPolygon(cellIdx);
      if (!poly) continue;
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let v = 1; v < poly.length; v++) {
        ctx.lineTo(poly[v][0], poly[v][1]);
      }
      ctx.closePath();
    }

    // Clip to the zone shape
    ctx.clip();

    // Faint solid tint fill
    ctx.fillStyle = palette.frameLine;
    ctx.globalAlpha = 0.08;
    ctx.fill();

    // Diagonal crosshatch lines at 45 degrees
    ctx.strokeStyle = palette.frameLine;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.15;

    // Compute bounding box of all cells for efficient line drawing
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (const cellIdx of zone.cells) {
      const poly = voronoi.cellPolygon(cellIdx);
      if (!poly) continue;
      for (const [px, py] of poly) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
    }

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;

    ctx.beginPath();
    for (let d = -(bboxH); d < bboxW + bboxH; d += lineSpacing) {
      ctx.moveTo(minX + d, maxY);
      ctx.lineTo(minX + d + bboxH, minY);
    }
    ctx.stroke();

    ctx.restore();

    // Border stroke (outside clip so it draws on all edges)
    ctx.save();
    ctx.beginPath();
    for (const cellIdx of zone.cells) {
      const poly = voronoi.cellPolygon(cellIdx);
      if (!poly) continue;
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let v = 1; v < poly.length; v++) {
        ctx.lineTo(poly[v][0], poly[v][1]);
      }
      ctx.closePath();
    }

    if (isHighlight) {
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
    } else {
      ctx.strokeStyle = palette.frameLine;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
    }
    ctx.stroke();
    ctx.restore();

    // Zone label at centroid
    const fontSize = Math.max(8, Math.round(Math.min(width, height) * 0.012));
    const label = labelPool[zi % labelPool.length];
    ctx.save();
    ctx.font = fontForText(label, fontSize, true, 'standard');
    ctx.fillStyle = palette.textSecondary;
    ctx.globalAlpha = 0.6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, zone.centroid[0], zone.centroid[1]);
    ctx.restore();
  }
}

/** Compute polygon area using the shoelace formula. */
function polygonArea(poly: ArrayLike<[number, number]> & { length: number }): number {
  let area = 0;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  }
  return Math.abs(area) / 2;
}
