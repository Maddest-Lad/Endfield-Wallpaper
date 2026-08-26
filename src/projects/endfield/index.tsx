import { defineProject } from '@core/project/defineProject';
import { endfieldMeta } from './meta';
import { endfieldStore } from './store';
import { endfieldPipeline } from './pipeline';
import { Controls } from './Controls';

const attribution = (
  <>
    Derivative fan work based on Arknights: Endfield. Not affiliated with Yostar or HyperGryph.
    Non-commercial use only. Font:{' '}
    <a
      href="https://github.com/lhclbt/Endfield_Font"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-ef-light/40"
    >
      Luo Butan
    </a>{' '}
    (CC BY-NC 4.0). Icons:{' '}
    <a
      href="https://github.com/Yue-plus/endfield_icons"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-ef-light/40"
    >
      Yue-plus
    </a>{' '}
    (MIT).
  </>
);

const endfield = defineProject({
  meta: { ...endfieldMeta, attribution },
  store: endfieldStore,
  pipeline: endfieldPipeline,
  Controls,
  exportName: (c) => `endfield-terrain-${c.seed}-${c.width}x${c.height}.png`,
});

export default endfield;
