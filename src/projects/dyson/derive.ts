import type { DysonConfig } from './config';
import type { DysonPalette } from './palette';
import { makePalette } from './palette';
import type { RingDef, ShellPanel } from './geometry';
import { buildRings, buildShell } from './geometry';

export interface DysonData {
  palette: DysonPalette;
  panels: ShellPanel[];
  rings: RingDef[];
  /** Identity of the shell geometry, for the shell layer's cache key. */
  shellKey: string;
  /** Identity of the ring geometry, for both ring layers and the debris swarm. */
  ringsKey: string;
}

// Two independent memos: retuning the rings must not rebuild ~1000 hex panels,
// and dragging the panel-density slider must not rebuild the trusses.
let cachedShellKey = '';
let cachedShell: ShellPanel[] | null = null;
let cachedRingsKey = '';
let cachedRings: RingDef[] | null = null;

export function deriveDyson(config: DysonConfig): DysonData {
  const shellKey = `${config.seed}|${config.hexSize}|${config.panelDensity}|${config.emissionScale}`;
  const ringsKey = `${config.seed}|${config.ringCount}|${config.ringWidth}|${config.ringInclination}|${config.ringSpread}|${config.showSpurs}`;

  let panels: ShellPanel[];
  if (shellKey === cachedShellKey && cachedShell) {
    panels = cachedShell;
  } else {
    panels = buildShell({
      seed: config.seed,
      hexSize: config.hexSize,
      panelDensity: config.panelDensity,
      emissionScale: config.emissionScale,
    });
    cachedShellKey = shellKey;
    cachedShell = panels;
  }

  let rings: RingDef[];
  if (ringsKey === cachedRingsKey && cachedRings) {
    rings = cachedRings;
  } else {
    rings = buildRings({
      seed: config.seed,
      count: config.ringCount,
      width: config.ringWidth,
      inclination: config.ringInclination,
      spread: config.ringSpread,
      spurs: config.showSpurs,
    });
    cachedRingsKey = ringsKey;
    cachedRings = rings;
  }

  return {
    palette: makePalette(config.coreColor, config.structureColor, config.accentColor),
    panels,
    rings,
    shellKey,
    ringsKey,
  };
}

export function clearDysonMemo(): void {
  cachedShellKey = '';
  cachedShell = null;
  cachedRingsKey = '';
  cachedRings = null;
}
