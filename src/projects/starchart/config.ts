import type { BaseConfig } from '@core/project/types';
import { randomSeed } from '@core/utils/random';
import type { ThemeName } from './palette';

export interface StarchartConfig extends BaseConfig {
  // --- Field ---
  theme: ThemeName;
  accentColor: string;
  /** Plate grain, 0 disables the tile entirely. */
  grain: number;
  hazeStrength: number;
  /** Parabolic bend of the galactic plane, -1..1. Also reshuffles star placement. */
  hazeCurve: number;
  starDensity: number;
  /** Bloom + diffraction-cross size on magnitude-0 anchors. */
  starBloom: number;
  /** Share of stars given a warm/cool spectral tint. */
  spectralTint: number;

  // --- Structure ---
  showGraticule: boolean;
  graticuleOpacity: number;
  /** Overprint a second, fainter grid from a different projection pole. */
  secondaryProjection: boolean;
  showConstellations: boolean;
  constellationCount: number;

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

    theme: 'void',
    accentColor: '#6FD3FF',
    grain: 0.35,
    hazeStrength: 0.6,
    hazeCurve: 0.35,
    starDensity: 1,
    starBloom: 0.6,
    spectralTint: 0.35,

    showGraticule: true,
    graticuleOpacity: 0.5,
    secondaryProjection: true,
    showConstellations: true,
    constellationCount: 16,

    showRoutes: true,
    routeDensity: 0.5,

    showLabels: true,
    labelDensity: 0.55,
    showCallouts: true,
    showInsets: true,

    showFrame: true,
    showTitleBlock: true,
    margin: 0.045,
  };
}

/** Produces a config, not pixels — the render stays reproducible from the seed. */
export function randomizeStarchart(): Partial<StarchartConfig> {
  const r = Math.random;
  return {
    seed: randomSeed(),
    hazeCurve: Math.round((r() * 1.8 - 0.9) * 100) / 100,
    hazeStrength: Math.round((0.32 + r() * 0.55) * 100) / 100,
    starDensity: Math.round((0.6 + r() * 1.1) * 100) / 100,
    starBloom: Math.round((0.3 + r() * 0.65) * 100) / 100,
    spectralTint: Math.round(r() * 80) / 100,
    constellationCount: 8 + Math.floor(r() * 22),
    routeDensity: Math.round((0.2 + r() * 0.7) * 100) / 100,
    labelDensity: Math.round((0.3 + r() * 0.6) * 100) / 100,
    graticuleOpacity: Math.round((0.25 + r() * 0.6) * 100) / 100,
    secondaryProjection: r() < 0.65,
    showInsets: r() < 0.75,
    showCallouts: r() < 0.8,
  };
}
