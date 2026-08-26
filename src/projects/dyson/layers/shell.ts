import type { RenderContext } from '@core/project/types';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { rgba } from '../palette';
import { TAU } from '../geometry';

/**
 * The hex shell. Panels come out of `derive` already projected onto the sphere,
 * so this only shades and composites them.
 *
 * Built panels are opaque — they are what occludes the star underneath, and the
 * gaps left by missing panels are the only reason the core reads as enclosed
 * rather than pasted behind.
 */
export function drawShell(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette, panels } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  const hair = Math.max(0.35, R * 0.0022);
  const emission = config.panelEmission;

  const trace = (pts: Float64Array) => {
    ctx.beginPath();
    ctx.moveTo(cx + pts[0] * R, cy + pts[1] * R);
    for (let k = 1; k < 6; k++) {
      ctx.lineTo(cx + pts[k * 2] * R, cy + pts[k * 2 + 1] * R);
    }
    ctx.closePath();
  };

  ctx.save();
  ctx.lineJoin = 'round';

  // Pass 1 — plating.
  for (const p of panels) {
    if (!p.present) continue;
    const lit = p.emission * emission;

    trace(p.pts);
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.panelDark;
    ctx.fill();

    if (lit > 0.015) {
      ctx.globalAlpha = Math.min(1, lit * 1.15);
      ctx.fillStyle = lit > 0.68 ? palette.panelHot : palette.panelLit;
      ctx.fill();
    }

    // Foreshortening: panels near the limb turn away from the viewer.
    const away = 1 - p.depth;
    if (away > 0.02) {
      ctx.globalAlpha = away * 0.5;
      ctx.fillStyle = palette.panelVoid;
      ctx.fill();
    }

    ctx.globalAlpha = 0.18 + p.depth * 0.3;
    ctx.strokeStyle = palette.panelEdge;
    ctx.lineWidth = hair;
    ctx.stroke();
  }

  // Pass 2 — bare framework where construction hasn't reached.
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = palette.ghost;
  ctx.lineWidth = hair;
  ctx.beginPath();
  for (const p of panels) {
    if (p.present) continue;
    ctx.moveTo(cx + p.pts[0] * R, cy + p.pts[1] * R);
    for (let k = 1; k < 6; k++) {
      ctx.lineTo(cx + p.pts[k * 2] * R, cy + p.pts[k * 2 + 1] * R);
    }
    ctx.closePath();
  }
  ctx.stroke();

  // Pass 3 — bloom off the hottest plating, additive within this layer only.
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1;
  const bloomR = Math.max(2, config.hexSize * R * 1.7);
  for (const p of panels) {
    if (!p.present) continue;
    const lit = p.emission * emission;
    if (lit < 0.5) continue;
    const x = cx + p.cx * R;
    const y = cy + p.cy * R;
    const g = ctx.createRadialGradient(x, y, 0, x, y, bloomR);
    g.addColorStop(0, rgba(palette.coreRgb, (lit - 0.5) * 0.9));
    g.addColorStop(1, rgba(palette.coreRgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - bloomR, y - bloomR, bloomR * 2, bloomR * 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Limb: a hard rail at the silhouette plus a thin standoff ring outside it.
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = palette.structureLit;
  ctx.lineWidth = Math.max(0.8, R * 0.006);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.stroke();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = palette.structure;
  ctx.lineWidth = hair * 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.035, 0, TAU);
  ctx.stroke();

  ctx.restore();
}
