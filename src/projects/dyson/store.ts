import { createProjectStore } from '@core/store/createProjectStore';
import { parseHash } from '@core/router/hashRoute';
import type { DysonConfig } from './config';
import { createDefaults, randomizeDyson } from './config';
import { PRESETS } from './presets';

/**
 * Module-level, so it is created only when this project's chunk loads — which is
 * what keeps its screen/DPR reads out of module-eval on the gallery page.
 */
export const dysonStore = createProjectStore<DysonConfig>({
  projectId: 'dyson',
  createDefaults,
  randomize: randomizeDyson,
  presets: PRESETS,
  initialConfigParam: parseHash(window.location.hash).configParam,
});
