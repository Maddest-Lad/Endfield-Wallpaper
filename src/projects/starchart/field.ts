import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { MW_WIDTH, MW_HEIGHT, MW_DATA_B64 } from './data/milkyway.gen';
import type { SkyView } from './sky';

/**
 * The Milky Way, from the real thing.
 *
 * `data/milkyway.gen.ts` is the five nested surface-brightness outlines
 * rasterised to an equirectangular map, so the band arrives with the Great Rift,
 * the Sagittarius bulge and the Cygnus star clouds already in the right places —
 * none of which a noise field was ever going to invent.
 *
 * The noise that remains is texture only: it modulates the real brightness
 * rather than shaping it, so the structure stays honest at any zoom while the
 * plate keeps its grain.
 */
export interface HazeField {
  /** Brightness at a logical-pixel coordinate, in [0, 1]. */
  at: (x: number, y: number) => number;
  /** Brightness at a sky coordinate, in [0, 1]. Unmodulated. */
  atSky: (ra: number, dec: number) => number;
}

let map: Uint8Array | null = null;

function decode(): Uint8Array {
  if (map) return map;
  // The generated blob is newline-wrapped; atob is specified to strip ASCII
  // whitespace, but stripping it here means not depending on that.
  const bin = atob(MW_DATA_B64.replace(/\s+/g, ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  map = out;
  return out;
}

/**
 * Bilinear sample of the brightness map.
 *
 * RA wraps and Dec clamps — getting that pairing wrong shows up as a hard seam
 * down 0h or a smear across the poles, both of which are very visible on a wide
 * field.
 */
function sample(m: Uint8Array, ra: number, dec: number): number {
  const fx = ((((ra % 360) + 360) % 360) / 360) * MW_WIDTH - 0.5;
  const fy = ((90 - dec) / 180) * MW_HEIGHT - 0.5;

  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;

  const wrap = (x: number) => ((x % MW_WIDTH) + MW_WIDTH) % MW_WIDTH;
  const clamp = (y: number) => (y < 0 ? 0 : y > MW_HEIGHT - 1 ? MW_HEIGHT - 1 : y);

  const xa = wrap(x0);
  const xb = wrap(x0 + 1);
  const ya = clamp(y0) * MW_WIDTH;
  const yb = clamp(y0 + 1) * MW_WIDTH;

  const top = m[ya + xa] * (1 - tx) + m[ya + xb] * tx;
  const bot = m[yb + xa] * (1 - tx) + m[yb + xb] * tx;
  return (top * (1 - ty) + bot * ty) / 255;
}

export function createHazeField(seed: string, view: SkyView): HazeField {
  const m = decode();
  const noise = createNoise2D(alea(`${seed}_clouds`));
  const fine = createNoise2D(alea(`${seed}_wisps`));

  // Noise frequency is tied to the field of view, not to the plate, so the cloud
  // texture keeps the same angular scale whether the plate is 1080p or 4K.
  const f1 = 0.9 / Math.max(view.fov, 1);
  const f2 = 3.1 / Math.max(view.fov, 1);

  const atSky = (ra: number, dec: number) => sample(m, ra, dec);

  return {
    atSky,
    at(x: number, y: number): number {
      const sky = view.invert(x, y);
      if (!sky) return 0;
      const base = atSky(sky[0], sky[1]);
      if (base <= 0.002) return 0;

      // Project onto a tangent plane before sampling the noise: sampling on raw
      // RA/Dec would stretch the texture towards the poles by 1/cos(dec).
      const u = (sky[0] - view.raCenter) * Math.cos((sky[1] * Math.PI) / 180);
      const v = sky[1] - view.decCenter;

      const n = 0.68 * noise(u * f1, v * f1) + 0.32 * fine(u * f2 + 19.3, v * f2 - 7.1);
      // Multiplicative, and floored well above zero: the noise is allowed to
      // mottle the band, never to punch a hole the real data did not have.
      const out = base * (0.72 + 0.44 * (n * 0.5 + 0.5));
      return out < 0 ? 0 : out > 1 ? 1 : out;
    },
  };
}
