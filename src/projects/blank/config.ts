import type { BaseConfig } from '@core/project/types';
import { randomSeed } from '@core/utils/random';

export interface BlankConfig extends BaseConfig {
  background: string;
  ink: string;
  /** Centre crosshair + margin rule, so an empty canvas still shows its bounds. */
  showGuides: boolean;
  margin: number;
}

/**
 * Lazy: reads screen/devicePixelRatio and rolls a seed, neither of which may
 * happen at module-eval time.
 */
export function createDefaults(): BlankConfig {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(screen.width * dpr);
  const h = Math.round(screen.height * dpr);
  const usable = w >= 100 && h >= 100;

  return {
    width: usable ? w : 1920,
    height: usable ? h : 1080,
    preset: usable ? 'device' : '1080p',
    seed: randomSeed(),
    background: '#F5F5F5',
    ink: '#1A1A1A',
    showGuides: true,
    margin: 0.04,
  };
}

/** Produces a config, not pixels — the render stays reproducible from the seed. */
export function randomizeBlank(): Partial<BlankConfig> {
  return {
    seed: randomSeed(),
    margin: Math.round(Math.random() * 16) / 200,
  };
}
