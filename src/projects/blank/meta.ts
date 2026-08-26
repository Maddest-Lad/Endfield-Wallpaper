import type { ProjectMeta } from '@core/project/defineProject';

/**
 * Metadata only. The registry imports this eagerly so the gallery can list the
 * project without loading its code — never import ./index or anything heavy here.
 */
export const blankMeta: ProjectMeta = {
  id: 'blank',
  title: 'Blank Canvas',
  tagline: 'Starting point for new experiments',
  version: 'v1.0',
  thumb: 'thumbs/blank.svg',
  cardAccent: '#8A8A8A',
};
