import type { ProjectMeta } from '@core/project/defineProject';

/**
 * Metadata only. The registry imports this eagerly so the gallery can list the
 * project without loading its code — never import ./index or anything heavy here.
 */
export const starchartMeta: ProjectMeta = {
  id: 'starchart',
  title: 'Stellar Cartography',
  tagline: 'Survey plates of inhabited space',
  version: 'v1.0',
  thumb: 'thumbs/starchart.svg',
  cardAccent: '#6FD3FF',
};
