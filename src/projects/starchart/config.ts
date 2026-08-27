import type { BaseConfig } from '@core/project/types';
import { randomSeed } from '@core/utils/random';
import type { ThemeName } from './palette';
import type { ProjectionName } from './sky';
import { SKY_REGIONS } from './regions';

export interface StarchartConfig extends BaseConfig {
  // --- Pointing ---
  /** Plate centre, J2000 right ascension in degrees, 0..360. */
  raCenter: number;
  /** Plate centre declination in degrees, -90..90. */
  decCenter: number;
  /** Rotation about the line of sight, in degrees. */
  roll: number;
  /** Field of view across the longer plate axis, in degrees. */
  fieldOfView: number;
  projection: ProjectionName;
  /**
   * Faintest magnitude plotted. The catalogue ends at 8.0; below about 3 the
   * plate is only the naked-eye sky.
   */
  limitingMag: number;

  // --- Field ---
  theme: ThemeName;
  accentColor: string;
  /** Plate grain, 0 disables the tile entirely. */
  grain: number;
  hazeStrength: number;
  /** Bloom + diffraction-cross size on the brightest stars. */
  starBloom: number;
  /** How strongly the real B-V colour index is allowed to tint the plate. */
  spectralTint: number;

  // --- Structure ---
  showGraticule: boolean;
  graticuleOpacity: number;
  /** Overprint the galactic coordinate grid on top of the equatorial one. */
  galacticGrid: boolean;
  showConstellations: boolean;
  /** Also name the constellations, not just draw their figures. */
  constellationLabels: boolean;

  // --- Network ---
  showRoutes: boolean;
  /** Node count and how much redundancy survives the backbone prune. */
  routeDensity: number;

  // --- Annotation ---
  showLabels: boolean;
  labelDensity: number;
  showCallouts: boolean;
  showInsets: boolean;

  // --- Plate ---
  showFrame: boolean;
  showTitleBlock: boolean;
  /** Two corner readouts: galactic coordinates, plate scale and distortion. */
  showDataBlocks: boolean;
  margin: number;
}

/**
 * Lazy: reads screen/devicePixelRatio and rolls a seed, neither of which may
 * happen at module-eval time.
 */
export function createDefaults(): StarchartConfig {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(screen.width * dpr);
  const h = Math.round(screen.height * dpr);
  const usable = w >= 100 && h >= 100;

  return {
    width: usable ? w : 1920,
    height: usable ? h : 1080,
    preset: usable ? 'device' : '1080p',
    seed: randomSeed(),

    // Orion: the most legible piece of sky there is, and a fair demonstration
    // that the plate is plotting something real.
    raCenter: 83.5,
    decCenter: 0,
    roll: 0,
    fieldOfView: 55,
    projection: 'stereographic',
    limitingMag: 7.4,

    theme: 'void',
    accentColor: '#6FD3FF',
    grain: 0.35,
    hazeStrength: 0.6,
    starBloom: 0.6,
    spectralTint: 0.45,

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
  };
}

/**
 * Produces a config, not pixels — the render stays reproducible from the seed.
 *
 * Pointing is rolled here rather than derived from the seed so that it survives
 * in the permalink and stays editable afterwards. Two thirds of the time it
 * lands on a named region, because a uniform point on the sphere is usually an
 * empty patch of Cetus.
 */
export function randomizeStarchart(): Partial<StarchartConfig> {
  const r = Math.random;

  let raCenter: number;
  let decCenter: number;
  let fieldOfView: number;

  if (r() < 0.65) {
    const region = SKY_REGIONS[Math.floor(r() * SKY_REGIONS.length)];
    raCenter = region.ra;
    decCenter = region.dec;
    fieldOfView = Math.round(region.fov * (0.8 + r() * 0.5));
  } else {
    raCenter = Math.round(r() * 3600) / 10;
    // Uniform in sin(dec), or every random plate crowds the poles.
    decCenter = Math.round(Math.asin(r() * 2 - 1) * (180 / Math.PI) * 10) / 10;
    fieldOfView = Math.round(28 + r() * 75);
  }

  return {
    seed: randomSeed(),
    raCenter,
    decCenter,
    fieldOfView,
    roll: Math.round((r() * 40 - 20) * 10) / 10,
    limitingMag: Math.round((6.2 + r() * 1.8) * 10) / 10,
    hazeStrength: Math.round((0.32 + r() * 0.55) * 100) / 100,
    starBloom: Math.round((0.3 + r() * 0.65) * 100) / 100,
    spectralTint: Math.round((0.15 + r() * 0.7) * 100) / 100,
    routeDensity: Math.round((0.2 + r() * 0.7) * 100) / 100,
    labelDensity: Math.round((0.3 + r() * 0.6) * 100) / 100,
    graticuleOpacity: Math.round((0.25 + r() * 0.6) * 100) / 100,
    galacticGrid: r() < 0.6,
    showInsets: r() < 0.75,
    showCallouts: r() < 0.8,
    showDataBlocks: r() < 0.7,
  };
}
