import type { ProjectMeta } from '@core/project/defineProject';

/**
 * Metadata only. The registry imports this eagerly so the gallery can list the
 * project without loading its code — never import ./index or anything heavy here.
 */
export const dysonMeta: ProjectMeta = {
  id: 'dyson',
  title: 'Dyson Bloom',
  tagline: 'Megastructure survey plates',
  version: 'v1.0',
  thumb: 'thumbs/dyson.svg',
  cardAccent: '#FFC66B',
};
