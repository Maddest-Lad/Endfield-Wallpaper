import { defineProject } from '@core/project/defineProject';
import { blankMeta } from './meta';
import { blankStore } from './store';
import { blankPipeline } from './pipeline';
import { Controls } from './Controls';

const blank = defineProject({
  meta: blankMeta,
  store: blankStore,
  pipeline: blankPipeline,
  Controls,
});

export default blank;
