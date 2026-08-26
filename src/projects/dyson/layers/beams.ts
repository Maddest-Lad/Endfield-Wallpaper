import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import type { ShellPanel } from '../geometry';
import { frameOf } from '../frame';
import { rgba } from '../palette';

/**
 * Collimated lances leaving the shell.
 *
 * Each beam starts on an emissive panel and travels straight out along that
 * panel's surface normal, which in an orthographic projection is just the
 * radial direction — so a beam can never cross the star, and one leaving a
 * panel near the centre of the disc is correctly foreshortened to a stub while
 * one leaving near the limb runs long.
 *
 * Drawn as tapered quads rather than strokes: a constant-width line reads as a
 * scratch on the plate, and canvas cannot taper a stroke.
 */
export function drawBeams(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette, panels } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  const count = Math.max(0, Math.round(config.beamCount));
  if (count === 0) return;

  // Emitters: built, bright, and far enough from the sub-viewer point that the
  // beam has some projected length to show.
  const emitters: ShellPanel[] = [];
  for (const p of panels) {
    if (!p.present) continue;
    if (p.emission < 0.3) continue;
    const r = Math.hypot(p.cx, p.cy);
    if (r < 0.28 || r > 0.97) continue;
    emitters.push(p);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < count; i++) {
    let ox: number;
    let oy: number;
    if (emitters.length > 0) {
      const p = emitters[Math.floor(rng() * emitters.length)];
      ox = p.cx;
      oy = p.cy;
    } else {
      const a = randomInRange(rng, 0, Math.PI * 2);
      const r = randomInRange(rng, 0.5, 0.9);
      ox = Math.cos(a) * r;
      oy = Math.sin(a) * r;
    }

    const rp = Math.hypot(ox, oy);
    if (rp < 1e-6) continue;
    const dx = ox / rp;
    const dy = oy / rp;

    // Foreshortened by the emitter's projected radius, then varied per beam.
    // Ends past the truss system (a ~ 1.8) without reaching for the frame edge.
    const len = randomInRange(rng, 1.15, 2.05) * (0.45 + 0.55 * rp);

    const sx = cx + ox * R;
    const sy = cy + oy * R;
    const ex = cx + dx * (rp + len) * R;
    const ey = cy + dy * (rp + len) * R;

    const px = -dy;
    const py = dx;

    // Tight at the muzzle, spreading and fading downrange.
    const quad = (w0: number, w1: number, fill: string | CanvasGradient) => {
      ctx.beginPath();
      ctx.moveTo(sx + px * w0, sy + py * w0);
      ctx.lineTo(ex + px * w1, ey + py * w1);
      ctx.lineTo(ex - px * w1, ey - py * w1);
      ctx.lineTo(sx - px * w0, sy - py * w0);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    const haze = ctx.createLinearGradient(sx, sy, ex, ey);
    haze.addColorStop(0, rgba(palette.coreRgb, 0.3));
    haze.addColorStop(0.3, rgba(palette.coreRgb, 0.14));
    haze.addColorStop(1, rgba(palette.coreRgb, 0));
    quad(R * 0.007, R * randomInRange(rng, 0.05, 0.085), haze);

    const body = ctx.createLinearGradient(sx, sy, ex, ey);
    body.addColorStop(0, rgba(palette.accentRgb, 0.6));
    body.addColorStop(0.45, rgba(palette.accentRgb, 0.24));
    body.addColorStop(1, rgba(palette.accentRgb, 0));
    quad(R * 0.004, R * randomInRange(rng, 0.02, 0.034), body);

    const core = ctx.createLinearGradient(sx, sy, ex, ey);
    core.addColorStop(0, palette.beam);
    core.addColorStop(0.25, rgba(palette.coreRgb, 0.55));
    core.addColorStop(0.8, rgba(palette.accentRgb, 0.1));
    core.addColorStop(1, rgba(palette.accentRgb, 0));
    quad(R * 0.0022, R * 0.009, core);

    // Bloom knot where the beam leaves the plating.
    const knot = R * randomInRange(rng, 0.07, 0.11);
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, knot);
    g.addColorStop(0, rgba(palette.coreRgb, 0.85));
    g.addColorStop(0.2, rgba(palette.accentRgb, 0.35));
    g.addColorStop(1, rgba(palette.accentRgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(sx - knot, sy - knot, knot * 2, knot * 2);
  }

  ctx.restore();
}
