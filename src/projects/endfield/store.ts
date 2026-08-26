import { createProjectStore } from '@core/store/createProjectStore';
import { parseHash } from '@core/router/hashRoute';
import type { WallpaperConfig } from './types';
import { createDefaults } from './defaults';
import { PRESETS } from './presets';
import { randomizeEndfield } from './randomize';

/**
 * Module-level, so it is created only when this project's chunk loads — which is
 * what keeps its screen/DPR reads out of module-eval on the gallery page.
 */
export const endfieldStore = createProjectStore<WallpaperConfig>({
  projectId: 'endfield',
  createDefaults,
  randomize: randomizeEndfield,
  presets: PRESETS,
  // Legacy bare-hash permalinks parse to this same field, so old shared links
  // keep working and self-heal to #/endfield?c=... on the first persist.
  initialConfigParam: parseHash(window.location.hash).configParam,
  // Read once so users who saved a config before namespacing don't lose it.
  legacyStorageKey: 'endfield-terrain-config',
});
