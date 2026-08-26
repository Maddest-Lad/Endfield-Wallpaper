import type { DysonConfig } from './config';

/** Generic stacks only — this project ships no font files. */
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export interface Frame {
  cx: number;
  cy: number;
  /** Shell radius in logical pixels. */
  R: number;
  /** min(width, height) — the unit every size in the plate is expressed against. */
  unit: number;
}

/**
 * Everything composes around the centre and min(width, height), so the plate
 * holds together at 3840x2160, 3440x1440 and 1080x1920 alike.
 */
export function frameOf(config: DysonConfig, width: number, height: number): Frame {
  const unit = Math.min(width, height);
  return {
    cx: width / 2,
    cy: height / 2,
    R: config.structureRadius * unit,
    unit,
  };
}
