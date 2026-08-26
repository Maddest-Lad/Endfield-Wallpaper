import type { LayerDef, Pipeline } from '@core/project/types';
import type { DysonConfig } from './config';
import type { DysonData } from './derive';
import { clearDysonMemo, deriveDyson } from './derive';
import { drawVoid } from './layers/void';
import { drawNebula } from './layers/nebula';
import { drawStarfield } from './layers/starfield';
import { drawCoreGlow } from './layers/coreGlow';
import { drawRingsFar } from './layers/ringsFar';
import { drawStarCore } from './layers/starCore';
import { drawShell } from './layers/shell';
import { drawFins } from './layers/fins';
import { drawRingsNear } from './layers/ringsNear';
import { drawBeams } from './layers/beams';
import { drawDebris } from './layers/debris';
import { drawGraticule } from './layers/graticule';
import { drawDataBlock } from './layers/dataBlock';
import { drawVignette } from './layers/vignette';

/**
 * Composition order is the whole trick: far trusses go down before the star,
 * the shell occludes both, and the near trusses close over the top. Reordering
 * this table breaks the depth read even though every layer still draws.
 *
 * Every field a layer reads is either in `baseKey` below or in that layer's own
 * `cacheKey` — otherwise the layer serves a stale canvas and its control does
 * nothing.
 */
const LAYERS: LayerDef<DysonConfig, DysonData>[] = [
  { name: 'void', draw: drawVoid },
  {
    name: 'nebula',
    enabled: (c) => c.nebulaStrength > 0,
    cacheKey: (c) => `${c.nebulaStrength}`,
    draw: drawNebula,
  },
  {
    name: 'starfield',
    enabled: (c) => c.starDensity > 0,
    cacheKey: (c) => `${c.starDensity}`,
    draw: drawStarfield,
  },
  { name: 'coreGlow', cacheKey: (c) => `${c.coreIntensity}`, draw: drawCoreGlow },
  { name: 'ringsFar', cacheKey: (_c, d) => d.ringsKey, draw: drawRingsFar },
  { name: 'starCore', cacheKey: (c) => `${c.coreIntensity}`, draw: drawStarCore },
  {
    name: 'shell',
    cacheKey: (c, d) => `${d.shellKey}|${c.panelEmission}|${c.hexSize}`,
    draw: drawShell,
  },
  {
    name: 'fins',
    enabled: (c) => c.finCount > 0,
    cacheKey: (c) => `${c.finCount}`,
    draw: drawFins,
  },
  { name: 'ringsNear', cacheKey: (_c, d) => d.ringsKey, draw: drawRingsNear },
  {
    name: 'beams',
    enabled: (c) => c.beamCount > 0,
    // Emitters are picked out of the shell panels, so the beams go stale if the
    // shell is rebuilt.
    cacheKey: (c, d) => `${c.beamCount}|${d.shellKey}`,
    draw: drawBeams,
  },
  {
    name: 'debris',
    enabled: (c) => c.debrisDensity > 0,
    cacheKey: (c, d) => `${c.debrisDensity}|${d.ringsKey}`,
    draw: drawDebris,
  },
  {
    name: 'graticule',
    enabled: (c) => c.showGraticule || c.showBrackets,
    cacheKey: (c) => `${c.showGraticule}|${c.showBrackets}`,
    draw: drawGraticule,
  },
  {
    name: 'dataBlock',
    enabled: (c) => c.showDataBlock,
    cacheKey: (c) => `${c.coreIntensity}|${c.panelDensity}|${c.ringCount}`,
    draw: drawDataBlock,
  },
  {
    name: 'vignette',
    enabled: (c) => c.vignette > 0,
    cacheKey: (c) => `${c.vignette}`,
    draw: drawVignette,
  },
];

export const dysonPipeline: Pipeline<DysonConfig, DysonData> = {
  derive: (config) => deriveDyson(config),
  // Shared by every layer: the seed, the frame, and the three source colours the
  // whole palette is derived from.
  baseKey: (c) =>
    `${c.seed}|${c.structureRadius}|${c.coreColor}|${c.structureColor}|${c.accentColor}`,
  layers: LAYERS,
  disposeDerived: clearDysonMemo,
};
