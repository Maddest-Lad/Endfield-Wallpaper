import type { WallpaperConfig, RenderContext } from './types';
import { generateHeightmap } from './terrain';
import { extractContours } from './contours';
import { getPalette } from '../utils/color';
import { createRng } from '../utils/random';
import { loadCanvasFont } from '../utils/fonts';

import { drawBackground, drawGrain } from './layers/background';
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

const GRID_SIZE = 250;

export async function renderWallpaper(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: WallpaperConfig,
  dpr: number = 1,
): Promise<void> {
  await loadCanvasFont();

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) throw new Error('Could not get 2D context');

  const { width, height } = config;

  // Scale buffer for HiDPI; all drawing stays in logical coords
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Compute grid dimensions (keep aspect ratio, ~250 cells on the longer axis)
  const aspect = width / height;
  const gridWidth = aspect >= 1 ? GRID_SIZE : Math.round(GRID_SIZE * aspect);
  const gridHeight = aspect >= 1 ? Math.round(GRID_SIZE / aspect) : GRID_SIZE;

  // Generate terrain
  const heightmap = generateHeightmap({
    width: gridWidth,
    height: gridHeight,
    seed: config.seed,
    scale: config.noiseScale,
    octaves: config.octaves,
    persistence: config.persistence,
    lacunarity: config.lacunarity,
  });

  // Extract contours
  const contourData = extractContours(heightmap, gridWidth, gridHeight, config.contourLevels);

  // Build render context
  const palette = getPalette(config.theme, config.accentColor);
  const rng = createRng(config.seed + '_render');

  const rc: RenderContext = {
    ctx,
    width,
    height,
    config,
    contourData,
    heightmap,
    gridWidth,
    gridHeight,
    rng,
    palette,
  };

  // Render layers in order
  drawBackground(rc);

  if (config.showGrid) {
    drawGrid(rc);
  }

  if (config.showScanLines) {
    drawScanLines(rc);
  }

  drawContourLines(rc);

  // Grain applied after contours but before text so text stays crisp
  drawGrain(rc);

  if (config.showHeroText) {
    drawHeroText(rc);
  }

  if (config.showAnnotations) {
    drawAnnotations(rc);
  }

  if (config.showReticles) {
    drawReticles(rc);
  }

  if (config.showCornerData) {
    drawCornerData(rc);
  }

  if (config.showFrames) {
    drawFrames(rc);
  }

  if (config.showDataPanel) {
    drawDataPanel(rc);
  }

  if (config.showAccents) {
    drawAccents(rc);
  }
}
