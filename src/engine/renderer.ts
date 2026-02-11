import type { WallpaperConfig, RenderContext, ContourData } from './types';
import { generateHeightmap } from './terrain';
import { extractContours } from './contours';
import { getPalette } from '../utils/color';
import { createRng } from '../utils/random';
import { loadCanvasFont } from '../utils/fonts';

import { drawBackground } from './layers/background';
import { drawGrid } from './layers/grid';
import { drawContourLines } from './layers/contourLines';
import { drawScanLines } from './layers/scanLines';
import { drawAnnotations } from './layers/annotations';
import { drawFrames } from './layers/frames';
import { drawReticles } from './layers/reticles';
import { drawCornerData } from './layers/cornerData';
import { drawHeroText } from './layers/heroText';
import { drawDataPanel } from './layers/dataPanel';
import { drawAccents } from './layers/accents';
import { drawZones } from './layers/zones';
import { drawLogoOverlay } from './layers/logoOverlay';

const GRID_SIZE = 250;

// Two-level terrain data cache — avoids recomputing expensive heightmap
// and contour extraction when only visual settings change.
let cachedTerrainKey = '';
let cachedHeightmap: Float64Array | null = null;
let cachedContourKey = '';
let cachedContours: ContourData[] | null = null;

export async function renderWallpaper(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: WallpaperConfig,
  dpr: number = 1,
): Promise<void> {
  await loadCanvasFont();

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error('Could not get 2D context');

  const width = Math.max(100, config.width);
  const height = Math.max(100, config.height);

  // Scale buffer for HiDPI; all drawing stays in logical coords
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Compute grid dimensions (keep aspect ratio, ~250 cells on the longer axis)
  const aspect = width / height;
  const gridWidth = aspect >= 1 ? GRID_SIZE : Math.round(GRID_SIZE * aspect);
  const gridHeight = aspect >= 1 ? Math.round(GRID_SIZE / aspect) : GRID_SIZE;

  // Generate terrain (with two-level cache)
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

  // Extract contours (cached separately so contourLevels changes reuse heightmap)
  const contourKey = `${terrainKey}|${config.contourLevels}`;
  let contourData: ContourData[];
  if (contourKey === cachedContourKey && cachedContours) {
    contourData = cachedContours;
  } else {
    contourData = extractContours(heightmap, gridWidth, gridHeight, config.contourLevels);
    cachedContourKey = contourKey;
    cachedContours = contourData;
  }

  // Build render context
  const palette = getPalette(config.theme, config.accentColor, config.contourColor ?? '#888888');

  // Each layer gets its own seeded RNG so toggling one layer
  // never shifts the random sequence for any other layer.
  const baseRc: Omit<RenderContext, 'rng'> = {
    ctx,
    width,
    height,
    config,
    contourData,
    heightmap,
    gridWidth,
    gridHeight,
    palette,
  };
  const layerRc = (name: string): RenderContext => ({
    ...baseRc,
    rng: createRng(config.seed + '_' + name),
  });

  // Render layers in order
  drawBackground(layerRc('background'));

  if (config.showGrid) {
    drawGrid(layerRc('grid'));
  }

  if (config.showScanLines) {
    drawScanLines(layerRc('scanLines'));
  }

  drawContourLines(layerRc('contourLines'));

  if (config.showZones) {
    drawZones(layerRc('zones'));
  }

  if (config.showHeroText) {
    drawHeroText(layerRc('heroText'));
  }

  if (config.showAnnotations) {
    drawAnnotations(layerRc('annotations'));
  }

  if (config.showReticles) {
    drawReticles(layerRc('reticles'));
  }

  if (config.showCornerData) {
    drawCornerData(layerRc('cornerData'));
  }

  if (config.showFrames) {
    drawFrames(layerRc('frames'));
  }

  if (config.showDataPanel) {
    drawDataPanel(layerRc('dataPanel'));
  }

  if (config.showAccents) {
    drawAccents(layerRc('accents'));
  }

  if ((config.logoVariant ?? 'none') !== 'none') {
    await drawLogoOverlay(layerRc('logoOverlay'));
  }
}
