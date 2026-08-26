import type { WallpaperConfig, ContourData, ThemePalette } from './types';
import { generateHeightmap } from './terrain';
import { extractContours } from './contours';
import { getPalette } from './palette';

/** Target cells on the longer axis of the heightmap grid. */
const GRID_SIZE = 250;

export interface EndfieldData {
  palette: ThemePalette;
  heightmap: Float64Array;
  contourData: ContourData[];
  gridWidth: number;
  gridHeight: number;
  /** Identity of the terrain, for layer cache keys that depend on it. */
  terrainKey: string;
}

// Two-level memo: changing contourLevels reuses the heightmap and only re-runs
// the (much cheaper) contour extraction.
let cachedTerrainKey = '';
let cachedHeightmap: Float64Array | null = null;
let cachedContourKey = '';
let cachedContours: ContourData[] | null = null;

export function deriveTerrain(
  config: WallpaperConfig,
  width: number,
  height: number,
): EndfieldData {
  // Grid keeps the output aspect ratio, ~GRID_SIZE cells on the longer axis.
  const aspect = width / height;
  const gridWidth = aspect >= 1 ? GRID_SIZE : Math.round(GRID_SIZE * aspect);
  const gridHeight = aspect >= 1 ? Math.round(GRID_SIZE / aspect) : GRID_SIZE;

  const terrainKey = `${config.seed}|${gridWidth}|${gridHeight}|${config.noiseScale}|${config.octaves}|${config.persistence}|${config.lacunarity}`;

  let heightmap: Float64Array;
  if (terrainKey === cachedTerrainKey && cachedHeightmap) {
    heightmap = cachedHeightmap;
  } else {
    heightmap = generateHeightmap({
      width: gridWidth,
      height: gridHeight,
      seed: config.seed,
      scale: config.noiseScale,
      octaves: config.octaves,
      persistence: config.persistence,
      lacunarity: config.lacunarity,
    });
    cachedTerrainKey = terrainKey;
    cachedHeightmap = heightmap;
    cachedContourKey = '';
    cachedContours = null;
  }

  const contourKey = `${terrainKey}|${config.contourLevels}`;
  let contourData: ContourData[];
  if (contourKey === cachedContourKey && cachedContours) {
    contourData = cachedContours;
  } else {
    contourData = extractContours(heightmap, gridWidth, gridHeight, config.contourLevels);
    cachedContourKey = contourKey;
    cachedContours = contourData;
  }

  return {
    palette: getPalette(config.theme, config.accentColor, config.contourColor ?? '#888888'),
    heightmap,
    contourData,
    gridWidth,
    gridHeight,
    terrainKey,
  };
}

export function clearTerrainMemo(): void {
  cachedTerrainKey = '';
  cachedHeightmap = null;
  cachedContourKey = '';
  cachedContours = null;
}
