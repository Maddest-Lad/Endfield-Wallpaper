import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { randomInRange, randomInt } from '@core/utils/random';

export const TAU = Math.PI * 2;
const SQRT3 = Math.sqrt(3);

/**
 * All geometry here is expressed in units of the shell radius, with the origin
 * at the composition centre. Layers multiply by `R = structureRadius * min(w, h)`.
 * That keeps the memo independent of output size — a 4K export reuses the same
 * shell the 1080p preview built.
 */

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

/**
 * Orthographic projection of a point on the visible hemisphere.
 *
 * The hex grid is laid out in *arc length* along the sphere (u), so a point at
 * arc distance u from the sub-viewer point projects to radius sin(u). That is
 * what compresses panels toward the limb: equal steps in u become ever smaller
 * steps in screen radius as u approaches pi/2.
 */
function project(ux: number, uy: number, out: [number, number]): void {
  const u = Math.hypot(ux, uy);
  if (u < 1e-9) {
    out[0] = 0;
    out[1] = 0;
    return;
  }
  const s = Math.sin(Math.min(u, Math.PI / 2)) / u;
  out[0] = ux * s;
  out[1] = uy * s;
}

export interface ShellPanel {
  /** Projected polygon, flat [x0, y0, x1, y1, ...] in shell-radius units. */
  pts: Float64Array;
  cx: number;
  cy: number;
  /** cos(theta): 1 at the sub-viewer point, 0 at the limb. Drives foreshortening shading. */
  depth: number;
  /** 0..1 seeded emission — how much star is showing through this panel. */
  emission: number;
  present: boolean;
}

export interface ShellSpec {
  seed: string;
  hexSize: number;
  panelDensity: number;
  emissionScale: number;
}

export function buildShell(spec: ShellSpec): ShellPanel[] {
  const a = Math.max(0.025, spec.hexSize);
  const es = Math.max(0.06, spec.emissionScale);
  const rng = alea(spec.seed + '_shell');
  const emitNoise = createNoise2D(alea(spec.seed + '_emission'));
  const gapNoise = createNoise2D(alea(spec.seed + '_gaps'));

  const uMax = Math.PI / 2;
  const rowStep = 1.5 * a;
  const colStep = SQRT3 * a;
  const rows = Math.ceil(uMax / rowStep) + 1;
  const cols = Math.ceil(uMax / colStep) + 1;

  // Pointy-top hexagon: vertices every 60 degrees, offset by 30.
  const vx: number[] = [];
  const vy: number[] = [];
  // Panel gap. Tight enough to read as plating, open enough that the star
  // shows through the seams.
  const inset = 0.92;
  for (let k = 0; k < 6; k++) {
    const ang = (Math.PI / 3) * k + Math.PI / 6;
    vx.push(Math.cos(ang) * a * inset);
    vy.push(Math.sin(ang) * a * inset);
  }

  const panels: ShellPanel[] = [];
  const out: [number, number] = [0, 0];

  for (let j = -rows; j <= rows; j++) {
    const uy = j * rowStep;
    const rowOffset = (j & 1) === 0 ? 0 : colStep / 2;
    for (let i = -cols; i <= cols; i++) {
      const ux = i * colStep + rowOffset;
      const u = Math.hypot(ux, uy);
      if (u > uMax * 0.985) continue;

      const pts = new Float64Array(12);
      for (let k = 0; k < 6; k++) {
        project(ux + vx[k], uy + vy[k], out);
        pts[k * 2] = out[0];
        pts[k * 2 + 1] = out[1];
      }
      project(ux, uy, out);

      const e = (emitNoise(ux / es, uy / es) + 1) / 2;
      const g = (gapNoise(ux / (es * 1.7) + 40, uy / (es * 1.7) - 40) + 1) / 2;

      panels.push({
        pts,
        cx: out[0],
        cy: out[1],
        depth: Math.cos(u),
        // Squared so most panels stay dark and the lit ones cluster into blooms.
        emission: e * e,
        present: g * 0.62 + rng() * 0.38 < spec.panelDensity,
      });
    }
  }

  return panels;
}

// ---------------------------------------------------------------------------
// Ring trusses
// ---------------------------------------------------------------------------

export interface RingSpur {
  t: number;
  len: number;
}

export interface RingDef {
  /** Ring radius in shell-radius units; > 1, so it clears the sphere. */
  a: number;
  /** Rotation of the ring's line of nodes in the image plane. */
  rot: number;
  cosI: number;
  sinI: number;
  halfWidth: number;
  /** Cross-ties across the band. */
  segments: number;
  /** Nodes/rivets per half. */
  nodes: number;
  spurs: RingSpur[];
  /** 0..1 emission of the accent detailing. */
  bright: number;
}

export interface RingSpec {
  seed: string;
  count: number;
  width: number;
  inclination: number;
  spread: number;
  spurs: boolean;
}

/**
 * A circle of radius `r` in a plane tilted by inclination I and rotated by `rot`.
 * The z component is what the occlusion split keys on: z > 0 is in front of the
 * sphere (t in (0, pi)), z < 0 is behind it.
 */
export function ringPoint(
  ring: RingDef,
  t: number,
  r: number,
  out: [number, number, number],
): void {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const cr = Math.cos(ring.rot);
  const sr = Math.sin(ring.rot);
  out[0] = r * (c * cr - s * sr * ring.cosI);
  out[1] = r * (c * sr + s * cr * ring.cosI);
  out[2] = r * s * ring.sinI;
}

export function buildRings(spec: RingSpec): RingDef[] {
  const count = Math.max(0, Math.round(spec.count));
  if (count === 0) return [];

  const rng = alea(spec.seed + '_rings');
  const rings: RingDef[] = [];

  for (let i = 0; i < count; i++) {
    const frac = count > 1 ? i / (count - 1) : 0.35;
    const a = 1.16 + frac * 0.62 + randomInRange(rng, -0.03, 0.03);

    // 20 deg to 80 deg of tilt, scattered per ring. Clamped away from face-on so
    // the near/far split always has something to occlude.
    const base = (20 + spec.inclination * 60) * (Math.PI / 180);
    const jitter = randomInRange(rng, -1, 1) * spec.spread * (35 * (Math.PI / 180));
    const inc = Math.min(1.48, Math.max(0.12, base + jitter));

    const spurs: RingSpur[] = [];
    if (spec.spurs) {
      const n = randomInt(rng, 5, 12);
      for (let k = 0; k < n; k++) {
        spurs.push({
          t: randomInRange(rng, 0, TAU),
          len: randomInRange(rng, 0.05, 0.17),
        });
      }
    }

    rings.push({
      a,
      rot: randomInRange(rng, 0, TAU),
      cosI: Math.cos(inc),
      sinI: Math.sin(inc),
      halfWidth: Math.max(0.008, spec.width) * (0.8 + frac * 0.45),
      segments: randomInt(rng, 30, 66),
      nodes: randomInt(rng, 5, 13),
      spurs,
      bright: randomInRange(rng, 0.45, 1),
    });
  }

  return rings;
}
