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

// --- Terrain data cache ---
let cachedTerrainKey = '';
let cachedHeightmap: Float64Array | null = null;
let cachedContourKey = '';
let cachedContours: ContourData[] | null = null;

// --- Per-layer OffscreenCanvas cache ---
interface LayerEntry {
  canvas: OffscreenCanvas;
  key: string;
}
const layerCache = new Map<string, LayerEntry>();

function cachedLayer(
  name: string,
  key: string,
  bufW: number,
  bufH: number,
  dpr: number,
  renderFn: (ctx: CanvasRenderingContext2D) => void,
): OffscreenCanvas {
  const entry = layerCache.get(name);
  if (entry && entry.key === key && entry.canvas.width === bufW && entry.canvas.height === bufH) {
    return entry.canvas;
  }
  const oc = new OffscreenCanvas(bufW, bufH);
  const ctx = oc.getContext('2d') as unknown as CanvasRenderingContext2D;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderFn(ctx);
  layerCache.set(name, { canvas: oc, key });
  return oc;
}

async function cachedLayerAsync(
  name: string,
  key: string,
  bufW: number,
  bufH: number,
  dpr: number,
  renderFn: (ctx: CanvasRenderingContext2D) => Promise<void>,
): Promise<OffscreenCanvas> {
  const entry = layerCache.get(name);
  if (entry && entry.key === key && entry.canvas.width === bufW && entry.canvas.height === bufH) {
    return entry.canvas;
  }
  const oc = new OffscreenCanvas(bufW, bufH);
  const ctx = oc.getContext('2d') as unknown as CanvasRenderingContext2D;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  await renderFn(ctx);
  layerCache.set(name, { canvas: oc, key });
  return oc;
}

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

  const bufW = Math.round(width * dpr);
  const bufH = Math.round(height * dpr);
  if (canvas.width !== bufW || canvas.height !== bufH) {
    canvas.width = bufW;
    canvas.height = bufH;
  }

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

  // Build render context data (ctx supplied per-layer for caching)
  const palette = getPalette(config.theme, config.accentColor, config.contourColor ?? '#888888');
  const rcData = { width, height, config, contourData, heightmap, gridWidth, gridHeight, palette };
  const makeRc = (name: string, layerCtx: CanvasRenderingContext2D): RenderContext => ({
    ...rcData,
    ctx: layerCtx,
    rng: createRng(config.seed + '_' + name),
  });

  // Cache keys — baseKey covers dimensions, seed, and palette inputs
  const baseKey = `${width}|${height}|${config.seed}|${config.theme}|${config.accentColor}|${config.contourColor}`;
  const contourLayerKey = `${baseKey}|${config.contourColorMode}|${config.contourGlow}|${config.contourLevels}|${terrainKey}`;
  const zonesKey = `${baseKey}|${terrainKey}`;
  const logoKey = `${baseKey}|${config.logoVariant}|${config.logoScale}|${config.logoOpacity}|${config.logoColor}`;

  // Render each layer to its own cached OffscreenCanvas, then composite
  const layers: OffscreenCanvas[] = [];

  // background (always on)
  layers.push(cachedLayer('background', baseKey, bufW, bufH, dpr,
    (lctx) => drawBackground(makeRc('background', lctx))));

  if (config.showGrid) {
    layers.push(cachedLayer('grid', baseKey, bufW, bufH, dpr,
      (lctx) => drawGrid(makeRc('grid', lctx))));
  }

  if (config.showScanLines) {
    layers.push(cachedLayer('scanLines', baseKey, bufW, bufH, dpr,
      (lctx) => drawScanLines(makeRc('scanLines', lctx))));
  }

  // contourLines (always on)
  layers.push(cachedLayer('contourLines', contourLayerKey, bufW, bufH, dpr,
    (lctx) => drawContourLines(makeRc('contourLines', lctx))));

  if (config.showZones) {
    layers.push(cachedLayer('zones', zonesKey, bufW, bufH, dpr,
      (lctx) => drawZones(makeRc('zones', lctx))));
  }

  if (config.showHeroText) {
    layers.push(cachedLayer('heroText', baseKey, bufW, bufH, dpr,
      (lctx) => drawHeroText(makeRc('heroText', lctx))));
  }

  if (config.showAnnotations) {
    layers.push(cachedLayer('annotations', baseKey, bufW, bufH, dpr,
      (lctx) => drawAnnotations(makeRc('annotations', lctx))));
  }

  if (config.showReticles) {
    layers.push(cachedLayer('reticles', baseKey, bufW, bufH, dpr,
      (lctx) => drawReticles(makeRc('reticles', lctx))));
  }

  if (config.showCornerData) {
    layers.push(cachedLayer('cornerData', baseKey, bufW, bufH, dpr,
      (lctx) => drawCornerData(makeRc('cornerData', lctx))));
  }

  if (config.showFrames) {
    layers.push(cachedLayer('frames', baseKey, bufW, bufH, dpr,
      (lctx) => drawFrames(makeRc('frames', lctx))));
  }

  if (config.showDataPanel) {
    layers.push(cachedLayer('dataPanel', baseKey, bufW, bufH, dpr,
      (lctx) => drawDataPanel(makeRc('dataPanel', lctx))));
  }

  if (config.showAccents) {
    layers.push(cachedLayer('accents', baseKey, bufW, bufH, dpr,
      (lctx) => drawAccents(makeRc('accents', lctx))));
  }

  if ((config.logoVariant ?? 'none') !== 'none') {
    layers.push(await cachedLayerAsync('logoOverlay', logoKey, bufW, bufH, dpr,
      (lctx) => drawLogoOverlay(makeRc('logoOverlay', lctx))));
  }

  // Composite all enabled layers onto main canvas (pixel-to-pixel).
  // No clearRect needed — background layer is opaque and covers every pixel.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const layer of layers) {
    ctx.drawImage(layer, 0, 0);
  }
}
