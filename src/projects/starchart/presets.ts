import type { ProjectPreset } from '@core/store/createProjectStore';
import type { StarchartConfig } from './config';

/**
 * Style only. None of these touch pointing (RA/Dec/roll/field of view/
 * projection/limiting mag) or the seed — that's what the region buttons, the
 * search bar and the orientation globe are for, and `reseed: false` on every
 * entry here is what keeps applying a look from also reshuffling wherever the
 * plate happens to be aimed and re-rolling its trade lanes.
 *
 * Every non-pointing field is still spelled out on every preset, the same
 * convention as before the split: a plate whose whole identity is its palette
 * and its depth should never carry a stray value left over from whatever was
 * applied last.
 */
export const PRESETS: ProjectPreset<StarchartConfig>[] = [
  {
    name: 'Void Atlas',
    reseed: false,
    config: {
      theme: 'void',
      accentColor: '#6FD3FF',
      grain: 0.3,
      hazeStrength: 0.55,
      starBloom: 0.6,
      spectralTint: 0.4,
      showGraticule: true,
      graticuleOpacity: 0.5,
      galacticGrid: true,
      showConstellations: true,
      constellationLabels: true,
      showRoutes: true,
      routeDensity: 0.5,
      showLabels: true,
      labelDensity: 0.55,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.045,
    },
  },
  {
    // CRT phosphor: one hue throughout, heavy grain, grid pushed forward.
    name: 'Phosphor',
    reseed: false,
    config: {
      theme: 'amber',
      accentColor: '#FF8A3D',
      grain: 0.62,
      hazeStrength: 0.5,
      starBloom: 0.85,
      spectralTint: 0.1,
      showGraticule: true,
      graticuleOpacity: 0.78,
      galacticGrid: false,
      showConstellations: true,
      constellationLabels: true,
      showRoutes: true,
      routeDensity: 0.66,
      showLabels: true,
      labelDensity: 0.7,
      showCallouts: true,
      showInsets: false,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.05,
    },
  },
  {
    // Naval chart: heavy plate furniture, restrained field, routes in the lead.
    name: 'Southern Naval',
    reseed: false,
    config: {
      theme: 'naval',
      accentColor: '#7FE3C0',
      grain: 0.2,
      hazeStrength: 0.4,
      starBloom: 0.42,
      spectralTint: 0.22,
      showGraticule: true,
      graticuleOpacity: 0.66,
      galacticGrid: true,
      showConstellations: false,
      constellationLabels: false,
      showRoutes: true,
      routeDensity: 0.8,
      showLabels: true,
      labelDensity: 0.75,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.055,
    },
  },
  {
    // Dark ink on cream stock. Bloom drops to near nothing — a glow on paper
    // reads as a smudge, not a star.
    name: 'Printed Plate',
    reseed: false,
    config: {
      theme: 'plate',
      accentColor: '#A03A2A',
      grain: 0.7,
      hazeStrength: 0.34,
      starBloom: 0.12,
      spectralTint: 0.18,
      showGraticule: true,
      graticuleOpacity: 0.85,
      galacticGrid: false,
      showConstellations: true,
      constellationLabels: true,
      showRoutes: true,
      routeDensity: 0.4,
      showLabels: true,
      labelDensity: 0.85,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.06,
    },
  },
  {
    // Everything turned up: the busy survey exposure.
    name: 'Deep Survey',
    reseed: false,
    config: {
      theme: 'survey',
      accentColor: '#FF5F7E',
      grain: 0.18,
      hazeStrength: 0.88,
      starBloom: 0.75,
      spectralTint: 0.6,
      showGraticule: true,
      graticuleOpacity: 0.3,
      galacticGrid: true,
      showConstellations: true,
      constellationLabels: false,
      showRoutes: true,
      routeDensity: 0.9,
      showLabels: true,
      labelDensity: 0.92,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.035,
    },
  },
  {
    // Teal accent over hot-pink linework on near-black, matching endfield's own
    // Miku preset (down to the same two hex codes). Uncluttered the same way
    // that one is: annotation, callouts, insets and the data blocks all off, so
    // the real Milky Way (now pink) and the constellation figures carry it.
    //
    // Pink only appears via the Milky Way wash and the warm end of a star's
    // real B-V tint — there is no structural "pink linework" layer the way
    // endfield's contours are, so both `hazeStrength` and `spectralTint` are
    // pushed toward their ceiling: near max tint is what makes a red supergiant
    // like Betelgeuse actually render pink instead of a faint blush, and it is
    // what still shows real colour on a field with little Milky Way in it.
    // Orion is a good demonstration of exactly this: Betelgeuse is a genuine
    // red supergiant and Rigel a genuine blue one, so the default pointing
    // alone puts one full-strength example of each Miku colour on the plate.
    name: 'Miku',
    reseed: false,
    config: {
      theme: 'miku',
      accentColor: '#39C5BB',
      grain: 0.22,
      hazeStrength: 0.82,
      starBloom: 0.85,
      spectralTint: 0.95,
      showGraticule: true,
      graticuleOpacity: 0.4,
      galacticGrid: false,
      showConstellations: true,
      constellationLabels: false,
      showRoutes: true,
      routeDensity: 0.55,
      showLabels: false,
      labelDensity: 0.4,
      showCallouts: false,
      showInsets: false,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: false,
      margin: 0.04,
    },
  },
  {
    // Cyanotype: white line-work on drafting blue, grid pushed forward the way
    // a drafting table's own ruling would be, with a construction-yellow accent.
    name: 'Blueprint',
    reseed: false,
    config: {
      theme: 'blueprint',
      accentColor: '#FFD166',
      grain: 0.08,
      hazeStrength: 0.35,
      starBloom: 0.5,
      spectralTint: 0.25,
      showGraticule: true,
      graticuleOpacity: 0.85,
      galacticGrid: true,
      showConstellations: true,
      constellationLabels: false,
      showRoutes: true,
      routeDensity: 0.6,
      showLabels: true,
      labelDensity: 0.5,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.045,
    },
  },
  {
    // Sumi-e: dark ink on warm washi paper, near-monochrome but for the
    // vermillion seal-stamp accent. Bloom stays low for the same reason
    // Printed Plate's does — ink does not glow.
    name: 'Ink Wash',
    reseed: false,
    config: {
      theme: 'inkwash',
      accentColor: '#B33A2E',
      grain: 0.55,
      hazeStrength: 0.3,
      starBloom: 0.1,
      spectralTint: 0.15,
      showGraticule: true,
      graticuleOpacity: 0.5,
      galacticGrid: false,
      showConstellations: true,
      constellationLabels: true,
      showRoutes: true,
      routeDensity: 0.35,
      showLabels: true,
      labelDensity: 0.6,
      showCallouts: true,
      showInsets: true,
      showFrame: true,
      showTitleBlock: true,
      showDataBlocks: true,
      margin: 0.05,
    },
  },
];
