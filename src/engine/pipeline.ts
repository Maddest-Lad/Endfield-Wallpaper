import type { Pipeline, LayerDef } from '@core/project/types';
import type { WallpaperConfig } from './types';
import { deriveTerrain, clearTerrainMemo, type EndfieldData } from './derive';

import { drawBackground } from './layers/background';
import { drawGrid } from './layers/grid';
import { drawScanLines } from './layers/scanLines';
import { drawContourLines } from './layers/contourLines';
import { drawZones } from './layers/zones';
import { drawHeroText } from './layers/heroText';
import { drawAnnotations } from './layers/annotations';
import { drawReticles } from './layers/reticles';
import { drawCornerData } from './layers/cornerData';
import { drawFrames } from './layers/frames';
import { drawDataPanel } from './layers/dataPanel';
import { drawAccents } from './layers/accents';
import { drawLogoOverlay } from './layers/logoOverlay';

export type EndfieldLayer = LayerDef<WallpaperConfig, EndfieldData>;

/**
 * Composition order, bottom to top. Layer `name` doubles as the RNG salt, so
 * renaming one changes its output for every existing seed and permalink.
 */
const LAYERS: EndfieldLayer[] = [
  { name: 'background', draw: drawBackground },
  { name: 'grid', enabled: (c) => c.showGrid, draw: drawGrid },
  { name: 'scanLines', enabled: (c) => c.showScanLines, draw: drawScanLines },
  {
    name: 'contourLines',
    cacheKey: (c, d) => `${c.contourColorMode}|${c.contourGlow}|${c.contourLevels}|${d.terrainKey}`,
    draw: drawContourLines,
  },
  {
    name: 'zones',
    enabled: (c) => c.showZones,
    cacheKey: (_c, d) => d.terrainKey,
    draw: drawZones,
  },
  { name: 'heroText', enabled: (c) => c.showHeroText, draw: drawHeroText },
  { name: 'annotations', enabled: (c) => c.showAnnotations, draw: drawAnnotations },
  { name: 'reticles', enabled: (c) => c.showReticles, draw: drawReticles },
  { name: 'cornerData', enabled: (c) => c.showCornerData, draw: drawCornerData },
  { name: 'frames', enabled: (c) => c.showFrames, draw: drawFrames },
  { name: 'dataPanel', enabled: (c) => c.showDataPanel, draw: drawDataPanel },
  { name: 'accents', enabled: (c) => c.showAccents, draw: drawAccents },
  {
    name: 'logoOverlay',
    enabled: (c) => (c.logoVariant ?? 'none') !== 'none',
    cacheKey: (c) => `${c.logoVariant}|${c.logoScale}|${c.logoOpacity}|${c.logoColor}`,
    draw: drawLogoOverlay,
  },
];

export const endfieldPipeline: Pipeline<WallpaperConfig, EndfieldData> = {
  fonts: ['Endfield'],
  derive: deriveTerrain,
  baseKey: (c) =>
    `${c.seed}|${c.theme}|${c.accentColor}|${c.contourColor}|${c.edgePadding ?? 0}`,
  layers: LAYERS,
  disposeDerived: clearTerrainMemo,
};
