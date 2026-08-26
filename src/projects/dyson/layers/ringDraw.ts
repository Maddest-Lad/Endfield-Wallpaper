import type { RingDef } from '../geometry';
import { ringPoint, TAU } from '../geometry';
import type { Frame } from '../frame';
import type { DysonPalette } from '../palette';
import { rgba } from '../palette';

const STEPS = 160;
const P: [number, number, number] = [0, 0, 0];

/**
 * Trusses are split at the sphere silhouette and drawn in two layers: z < 0
 * (t in (pi, 2pi)) behind the shell, z > 0 (t in (0, pi)) in front of it.
 * That single split is what gives the plate its depth — a ring drawn whole
 * always reads as a flat decal over the sphere.
 */
export function drawRingHalf(
  ctx: CanvasRenderingContext2D,
  ring: RingDef,
  frame: Frame,
  palette: DysonPalette,
  near: boolean,
): void {
  const { cx, cy, R } = frame;
  const t0 = near ? 0 : Math.PI;
  const dim = near ? 1 : 0.5;
  const hair = Math.max(0.5, R * 0.004);

  const rOuter = ring.a + ring.halfWidth;
  const rInner = ring.a - ring.halfWidth;

  const at = (t: number, r: number): [number, number] => {
    ringPoint(ring, t, r, P);
    return [cx + P[0] * R, cy + P[1] * R];
  };

  ctx.save();

  // Band.
  ctx.beginPath();
  for (let k = 0; k <= STEPS; k++) {
    const p = at(t0 + (Math.PI * k) / STEPS, rOuter);
    if (k === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  }
  for (let k = STEPS; k >= 0; k--) {
    const p = at(t0 + (Math.PI * k) / STEPS, rInner);
    ctx.lineTo(p[0], p[1]);
  }
  ctx.closePath();
  ctx.fillStyle = palette.structureDark;
  ctx.globalAlpha = near ? 0.95 : 0.78;
  ctx.fill();

  // Cross-ties across the band.
  ctx.globalAlpha = 0.4 * dim;
  ctx.strokeStyle = palette.structure;
  ctx.lineWidth = hair;
  ctx.beginPath();
  for (let k = 0; k <= ring.segments; k++) {
    const t = t0 + (Math.PI * k) / ring.segments;
    const a = at(t, rInner);
    const b = at(t, rOuter);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }
  ctx.stroke();

  // Edges. The inner rail catches the core, so it runs brighter than the outer.
  const rail = (r: number, color: string, alpha: number, w: number) => {
    ctx.globalAlpha = alpha * dim;
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (let k = 0; k <= STEPS; k++) {
      const p = at(t0 + (Math.PI * k) / STEPS, r);
      if (k === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  };

  rail(rOuter, palette.structure, 0.75, hair * 1.2);
  rail(rInner, palette.structureLit, 0.95, hair * 1.4);
  rail(ring.a, palette.structure, 0.3, hair * 0.9);

  // Nodes, plus spurs standing off the outer rail.
  ctx.globalCompositeOperation = 'lighter';
  const nodeR = Math.max(1, ring.halfWidth * R * 0.42);
  for (let k = 0; k < ring.nodes; k++) {
    const t = t0 + (Math.PI * (k + 0.5)) / ring.nodes;
    const p = at(t, ring.a);
    const glow = nodeR * 5;
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], glow);
    g.addColorStop(0, rgba(palette.accentRgb, 0.55 * ring.bright * dim));
    g.addColorStop(1, rgba(palette.accentRgb, 0));
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(p[0] - glow, p[1] - glow, glow * 2, glow * 2);

    ctx.globalAlpha = 0.9 * dim;
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(p[0], p[1], nodeR, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  ctx.globalAlpha = 0.6 * dim;
  ctx.strokeStyle = palette.structureLit;
  ctx.lineWidth = hair;
  ctx.fillStyle = palette.structure;
  for (const spur of ring.spurs) {
    // Spur angles are stored over the full circle; only draw the ones that
    // belong to this half, so the two layers never double up.
    const t = ((spur.t % TAU) + TAU) % TAU;
    if (near ? !(t < Math.PI) : t < Math.PI) continue;
    const base = at(t, rOuter);
    const tip = at(t, rOuter + spur.len);
    ctx.beginPath();
    ctx.moveTo(base[0], base[1]);
    ctx.lineTo(tip[0], tip[1]);
    ctx.stroke();
    const bw = Math.max(1.2, hair * 2.4);
    ctx.fillRect(tip[0] - bw, tip[1] - bw, bw * 2, bw * 2);
  }

  ctx.restore();
}
