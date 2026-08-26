import type { Pipeline, LayerDef } from '@core/project/types';
import type { BlankConfig } from './config';
import { drawBackground } from './layers/background';
import { drawGuides } from './layers/guides';

/**
 * TData is `void` here: this project has no expensive precomputation, which is
 * the point — it proves the derive step is genuinely optional rather than an
 * Endfield-shaped assumption baked into the core.
 */
const LAYERS: LayerDef<BlankConfig, void>[] = [
  { name: 'background', draw: drawBackground },
  { name: 'guides', enabled: (c) => c.showGuides, draw: drawGuides },
];

export const blankPipeline: Pipeline<BlankConfig, void> = {
  derive: () => undefined,
  // Every config field these layers read must appear here or in a layer's own
  // cacheKey, or the layer renders stale.
  baseKey: (c) => `${c.seed}|${c.background}|${c.ink}|${c.margin}`,
  layers: LAYERS,
};
