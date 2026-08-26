import type { RenderContext } from '@core/project/types';
import { randomInt, randomPick } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { MONO, frameOf } from '../frame';

const CLASSES = ['TYPE I', 'TYPE II', 'TYPE II+', 'TYPE III'];
const PHASES = ['ACCRETION', 'PLATING', 'TRUSSWORK', 'TAP ACTIVE', 'STANDBY'];

/**
 * A restrained survey caption. The numbers are read off the config, so the
 * plate never claims something the picture doesn't show: shell completion
 * tracks panel density, output tracks core intensity, radius tracks the shell.
 */
export function drawDataBlock(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;
  const { R, unit } = frameOf(config, width, height);

  const fs = Math.max(9, unit * 0.0115);
  const lh = fs * 1.62;
  const margin = unit * 0.075;
  const x = margin;

  const rows: [string, string][] = [
    ['DESIGNATION', `DS-${randomInt(rng, 1000, 9999)}-${randomPick(rng, ['A', 'B', 'C', 'K', 'X'])}`],
    ['CLASS', `${randomPick(rng, CLASSES)} SWARM`],
    ['SHELL RADIUS', `${(0.62 + config.structureRadius * 4.1).toFixed(2)} AU`],
    ['TAP OUTPUT', `${(0.18 + config.coreIntensity * 1.22).toFixed(2)} SOL`],
    ['ENCLOSURE', `${(config.panelDensity * 100).toFixed(1)} %`],
    ['TRUSS ARRAY', `${config.ringCount} RING / ${randomInt(rng, 2, 9)} SPINE`],
    ['PHASE', randomPick(rng, PHASES)],
    ['SURVEY', `${randomInt(rng, 2400, 2899)}.${String(randomInt(rng, 1, 12)).padStart(2, '0')}.${String(randomInt(rng, 1, 28)).padStart(2, '0')}`],
  ];

  const blockH = rows.length * lh;
  const y = height - margin - blockH;

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // Header rule.
  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(x, y - lh * 1.35, fs * 2.2, Math.max(1, fs * 0.16));

  ctx.font = `${Math.round(fs * 0.92)}px ${MONO}`;
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = palette.textDim;
  ctx.fillText('M E G A S T R U C T U R E   S U R V E Y', x + fs * 3, y - lh * 1.15);

  ctx.font = `${Math.round(fs)}px ${MONO}`;
  const valueX = x + fs * 0.62 * 14;

  rows.forEach(([label, value], i) => {
    const ly = y + i * lh;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = palette.textDim;
    ctx.fillText(label, x, ly);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = palette.text;
    ctx.fillText(value, valueX, ly);
  });

  // Scale bar: one shell radius, so the plate carries its own reference.
  const barY = height - margin;
  const barW = Math.min(R, width * 0.18);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = Math.max(0.8, unit * 0.0012);
  ctx.beginPath();
  ctx.moveTo(x, barY);
  ctx.lineTo(x + barW, barY);
  ctx.moveTo(x, barY - fs * 0.32);
  ctx.lineTo(x, barY + fs * 0.32);
  ctx.moveTo(x + barW, barY - fs * 0.32);
  ctx.lineTo(x + barW, barY + fs * 0.32);
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  ctx.fillStyle = palette.textDim;
  ctx.font = `${Math.round(fs * 0.85)}px ${MONO}`;
  ctx.fillText('1.00 R', x + barW + fs * 0.6, barY + fs * 0.3);

  ctx.restore();
}
