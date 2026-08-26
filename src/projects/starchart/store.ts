import { createProjectStore } from '@core/store/createProjectStore';
import { parseHash } from '@core/router/hashRoute';
import type { StarchartConfig } from './config';
import { createDefaults, randomizeStarchart } from './config';
import { PRESETS } from './presets';

export const starchartStore = createProjectStore<StarchartConfig>({
  projectId: 'starchart',
  createDefaults,
  randomize: randomizeStarchart,
  presets: PRESETS,
  initialConfigParam: parseHash(window.location.hash).configParam,
});
