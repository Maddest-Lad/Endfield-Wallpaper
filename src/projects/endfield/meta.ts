import type { ProjectMeta } from '@core/project/defineProject';

/**
 * Metadata only — imported eagerly by the registry so the gallery can list this
 * project without pulling in d3, simplex-noise, or the layer code. This file must
 * never import ./index or anything heavy, or the lazy chunk collapses into the
 * main bundle.
 */
export const endfieldMeta: ProjectMeta = {
  id: 'endfield',
  title: 'Endfield',
  tagline: 'Terrain Generator',
  version: 'v1.0',
  thumb: 'thumbs/endfield.svg',
  cardAccent: '#FFE600',
  themeClass: 'theme-endfield',
};
