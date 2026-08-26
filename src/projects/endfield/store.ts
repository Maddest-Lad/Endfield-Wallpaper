import { createProjectStore } from '@core/store/createProjectStore';
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
  // Pre-router: the whole hash is the base64 payload. Phase 6 replaces this with
  // the ?c= param parsed out of the route.
  initialConfigParam: window.location.hash.replace(/^#/, '') || null,
  // Read once so users who saved a config before namespacing don't lose it.
  legacyStorageKey: 'endfield-terrain-config',
});
