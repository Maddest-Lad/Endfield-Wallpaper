import type { Pipeline, LayerDef } from '@core/project/types';
import type { StarchartConfig } from './config';
import { deriveStarchart, clearStarchartMemo, type StarchartData } from './derive';

import { drawPlate } from './layers/plate';
import { drawHaze } from './layers/haze';
import { drawGraticule } from './layers/graticule';
import { drawStarfield } from './layers/starfield';
import { drawBeacons } from './layers/beacons';
import { drawConstellations } from './layers/constellations';
import { drawRoutes } from './layers/routes';
import { drawInsets } from './layers/insets';
import { drawLabels } from './layers/labels';
import { drawCallouts } from './layers/callouts';
import { drawFrame } from './layers/frame';
import { drawTitleBlock } from './layers/titleBlock';

export type StarchartLayer = LayerDef<StarchartConfig, StarchartData>;

/**
 * Composition order, bottom to top. Layer `name` doubles as the RNG salt, so
 * renaming one changes its output for every existing seed and permalink.
 *
 * Every config field a layer reads appears either in `baseKey` below or in that
 * layer's own `cacheKey` — otherwise the layer serves a stale canvas and its
 * control silently does nothing.
 *
 * `data.catalogKey` covers the whole pointing: projection, centre, roll, field
 * of view, limiting magnitude and spectral tint. Any layer that reads projected
 * sky therefore only needs that one key, not the six fields behind it.
 */
const LAYERS: StarchartLayer[] = [
  { name: 'plate', cacheKey: (c) => `${c.grain}`, draw: drawPlate },
  { name: 'haze', cacheKey: (c, d) => `${d.catalogKey}|${c.hazeStrength}`, draw: drawHaze },
  {
    name: 'graticule',
    enabled: (c) => c.showGraticule,
    cacheKey: (c, d) =>
      `${d.catalogKey}|${c.graticuleOpacity}|${c.galacticGrid}|${c.margin}`,
    draw: drawGraticule,
  },
  { name: 'starfield', cacheKey: (_c, d) => d.catalogKey, draw: drawStarfield },
  {
    name: 'beacons',
    cacheKey: (c, d) => `${d.catalogKey}|${c.starBloom}`,
    draw: drawBeacons,
  },
  {
    name: 'constellations',
    enabled: (c) => c.showConstellations,
    cacheKey: (c, d) => `${d.catalogKey}|${c.constellationLabels}|${c.margin}`,
    draw: drawConstellations,
  },
  {
    name: 'routes',
    enabled: (c) => c.showRoutes,
    cacheKey: (c, d) => `${d.graphKey}|${c.margin}`,
    draw: drawRoutes,
  },
  {
    name: 'insets',
    // Insets re-project the sky inside each box, so they depend on the pointing
    // and on the limiting magnitude they deepen from.
    enabled: (c) => c.showInsets,
    cacheKey: (c, d) => `${d.catalogKey}|${c.showTitleBlock}`,
    draw: drawInsets,
  },
  {
    name: 'labels',
    enabled: (c) => c.showLabels,
    cacheKey: (c, d) => `${d.catalogKey}|${c.labelDensity}|${c.showTitleBlock}`,
    draw: drawLabels,
  },
  {
    name: 'callouts',
    enabled: (c) => c.showCallouts,
    cacheKey: (_c, d) => d.graphKey,
    draw: drawCallouts,
  },
  { name: 'frame', enabled: (c) => c.showFrame, draw: drawFrame },
  {
    name: 'titleBlock',
    enabled: (c) => c.showTitleBlock,
    cacheKey: (_c, d) => d.graphKey,
    draw: drawTitleBlock,
  },
];

export const starchartPipeline: Pipeline<StarchartConfig, StarchartData> = {
  derive: deriveStarchart,
  baseKey: (c) => `${c.seed}|${c.theme}|${c.accentColor}|${c.margin}`,
  layers: LAYERS,
  disposeDerived: clearStarchartMemo,
};
