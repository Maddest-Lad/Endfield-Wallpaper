import { defineProject } from '@core/project/defineProject';
import { starchartMeta } from './meta';
import { starchartStore } from './store';
import { starchartPipeline } from './pipeline';
import { Controls } from './Controls';
import { themeVarsFor } from './palette';

const starchart = defineProject({
  meta: starchartMeta,
  store: starchartStore,
  pipeline: starchartPipeline,
  Controls,
  exportName: (c) => `starchart-${c.theme}-${c.seed}-${c.width}x${c.height}.png`,
  themeVars: (c) => themeVarsFor(c.theme, c.accentColor),
});

export default starchart;
