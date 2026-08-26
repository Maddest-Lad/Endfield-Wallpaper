import type { RenderContext } from '@core/project/types';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { TAU } from '../geometry';

/**
 * Survey furniture: a measurement graticule around the structure and brackets
 * at the plate corners. Deliberately thin and low-contrast — this should read
 * as a printed reference frame, not a HUD.
 */
export function drawGraticule(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette } = data;
  const { cx, cy, R, unit } = frameOf(config, width, height);

  const hair = Math.max(0.5, unit * 0.0008);

  ctx.save();
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = hair;

  if (config.showGraticule) {
    ctx.globalAlpha = 0.28;
    ctx.setLineDash([unit * 0.006, unit * 0.012]);
    // All outside the silhouette — a graticule ruled across the structure
    // would read as a decal on the sphere rather than a frame around it.
    for (const r of [1.32, 1.95, 2.6, 3.3]) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * r, 0, TAU);
      ctx.stroke();
    }

    // Centre axes, stopped short of the structure so they don't cross the star.
    const gap = R * 1.18;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bearing ticks just outside the limb.
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (let deg = 0; deg < 360; deg += 5) {
      const a = (deg * Math.PI) / 180;
      const long = deg % 30 === 0;
      const r0 = R * 1.06;
      const r1 = R * (long ? 1.14 : 1.095);
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    }
    ctx.stroke();
  }

  if (config.showBrackets) {
    const m = unit * 0.045;
    const arm = unit * 0.05;
    const corners: [number, number, number, number][] = [
      [m, m, 1, 1],
      [width - m, m, -1, 1],
      [m, height - m, 1, -1],
      [width - m, height - m, -1, -1],
    ];
    const bracketPath = () => {
      ctx.beginPath();
      for (const [x, y, sx, sy] of corners) {
        ctx.moveTo(x + sx * arm, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * arm);
      }
      ctx.stroke();
    };

    // Dark backing first: over a bright nebula corner the accent alone loses
    // its edge, and these have to read on Ember Giant as well as on the dark
    // presets.
    const bracketW = Math.max(0.8, unit * 0.0017);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = palette.structureDark;
    ctx.lineWidth = bracketW * 3;
    ctx.lineCap = 'round';
    bracketPath();

    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = bracketW;
    bracketPath();
    ctx.lineCap = 'butt';

    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = hair;
    ctx.strokeRect(m, m, width - m * 2, height - m * 2);
  }

  ctx.restore();
}
