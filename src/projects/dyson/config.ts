import type { BaseConfig } from '@core/project/types';
import { randomSeed } from '@core/utils/random';

/**
 * A megastructure enclosing a star, drawn as an orthographic survey plate.
 *
 * Colour is deliberately three fields, not a dozen: `palette.ts` derives every
 * other tone (void, nebula, panel, structure, text) from these three so a preset
 * can restate the whole look by naming three hexes.
 */
export interface DysonConfig extends BaseConfig {
  /** Shell radius as a fraction of min(width, height). */
  structureRadius: number;
  /** Hex panel circumradius, in units of shell radius (arc length on the sphere). */
  hexSize: number;
  /** Fraction of panels that have been built. Below 1 the shell reads as unfinished. */
  panelDensity: number;
  /** How hard the lit panels glow — the star leaking through the construction. */
  panelEmission: number;
  /** Feature size of the emission/void noise. Small values scatter, large ones cluster. */
  emissionScale: number;

  /** Brightness and reach of the enclosed star. */
  coreIntensity: number;

  coreColor: string;
  structureColor: string;
  accentColor: string;

  ringCount: number;
  /** Truss band half-width, in units of shell radius. */
  ringWidth: number;
  /** 0 = near face-on, 1 = near edge-on. */
  ringInclination: number;
  /** Per-ring inclination scatter. */
  ringSpread: number;
  /** Spines and spurs standing off the ring bands. */
  showSpurs: boolean;

  /** Radiator fins standing off the shell limb. */
  finCount: number;
  /** Collimated energy lances from the shell out past the rings. */
  beamCount: number;
  /** Construction swarm — ships and hab-blocks, denser near the rings. */
  debrisDensity: number;

  starDensity: number;
  nebulaStrength: number;

  showGraticule: boolean;
  showBrackets: boolean;
  showDataBlock: boolean;
  vignette: number;
}

/**
 * Lazy: reads screen/devicePixelRatio and rolls a seed, neither of which may
 * happen at module-eval time.
 */
export function createDefaults(): DysonConfig {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(screen.width * dpr);
  const h = Math.round(screen.height * dpr);
  const usable = w >= 100 && h >= 100;

  return {
    width: usable ? w : 1920,
    height: usable ? h : 1080,
    preset: usable ? 'device' : '1080p',
    seed: randomSeed(),

    structureRadius: 0.26,
    hexSize: 0.09,
    panelDensity: 0.78,
    panelEmission: 0.6,
    emissionScale: 0.45,

    coreIntensity: 0.55,

    coreColor: '#9AD5FF',
    structureColor: '#8A7CF0',
    accentColor: '#FFC66B',

    ringCount: 4,
    ringWidth: 0.055,
    ringInclination: 0.55,
    ringSpread: 0.5,
    showSpurs: true,

    finCount: 9,
    beamCount: 2,
    debrisDensity: 0.5,

    starDensity: 0.5,
    nebulaStrength: 0.45,

    showGraticule: true,
    showBrackets: true,
    showDataBlock: true,
    vignette: 0.45,
  };
}

const CORE_COLORS = ['#9AD5FF', '#FFD9A8', '#FF9C6B', '#E8F6FF', '#C9FF8F', '#FFB3E6'];
const STRUCTURE_COLORS = ['#8A7CF0', '#5FA8C7', '#C77B5F', '#7FA0B8', '#9E6FD6', '#6FB89A'];
const ACCENT_COLORS = ['#FFC66B', '#6BE8FF', '#FF6B8A', '#B8FF6B', '#FFFFFF', '#FF8A3D'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function range(min: number, max: number, step: number): number {
  const v = min + Math.random() * (max - min);
  return Math.round(v / step) * step;
}

/** Produces a config, not pixels — the render stays reproducible from the seed. */
export function randomizeDyson(): Partial<DysonConfig> {
  return {
    seed: randomSeed(),
    structureRadius: range(0.19, 0.32, 0.005),
    hexSize: range(0.06, 0.13, 0.005),
    panelDensity: range(0.45, 1, 0.01),
    panelEmission: range(0.25, 0.95, 0.01),
    emissionScale: range(0.2, 0.9, 0.01),
    coreIntensity: range(0.3, 0.9, 0.01),
    coreColor: pick(CORE_COLORS),
    structureColor: pick(STRUCTURE_COLORS),
    accentColor: pick(ACCENT_COLORS),
    ringCount: Math.round(range(2, 6, 1)),
    ringWidth: range(0.03, 0.085, 0.005),
    ringInclination: range(0.15, 0.9, 0.01),
    ringSpread: range(0, 0.9, 0.01),
    showSpurs: Math.random() < 0.75,
    finCount: Math.round(range(0, 14, 1)),
    beamCount: Math.round(range(0, 4, 1)),
    debrisDensity: range(0.15, 0.9, 0.01),
    starDensity: range(0.25, 0.85, 0.01),
    nebulaStrength: range(0.15, 0.8, 0.01),
    vignette: range(0.2, 0.7, 0.01),
  };
}
