import { createProjectStore } from '@core/store/createProjectStore';
import { parseHash } from '@core/router/hashRoute';
import type { BlankConfig } from './config';
import { createDefaults, randomizeBlank } from './config';

export const blankStore = createProjectStore<BlankConfig>({
  projectId: 'blank',
  createDefaults,
  randomize: randomizeBlank,
  presets: [],
  initialConfigParam: parseHash(window.location.hash).configParam,
});
