import { defineProject } from '@core/project/defineProject';
import { dysonMeta } from './meta';
import { dysonStore } from './store';
import { dysonPipeline } from './pipeline';
import { Controls } from './Controls';

const dyson = defineProject({
  meta: dysonMeta,
  store: dysonStore,
  pipeline: dysonPipeline,
  Controls,
  exportName: (c) => `dyson-bloom-${c.seed}-${c.width}x${c.height}.png`,
});

export default dyson;
