import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

/**
 * The galactic haze field: a bent band of layered low-frequency simplex noise.
 *
 * It is sampled twice — once by the `haze` layer to paint the wash, and once by
 * the catalogue to bias star placement toward the galactic plane — so it lives in
 * `derive` and both consumers share the same instance.
 */
export interface HazeField {
  /** Density at a logical-pixel coordinate, in [0, 1]. */
  at: (x: number, y: number) => number;
}

export function createHazeField(
  seed: string,
  width: number,
  height: number,
  curve: number,
): HazeField {
  const prng = alea(`${seed}_galaxy`);
  const noise = createNoise2D(prng);
  const clouds = createNoise2D(alea(`${seed}_clouds`));

  // Band axis: near-horizontal, tilted deterministically by the seed.
  const theta = (prng() - 0.5) * 0.9;
  const cos = Math.cos(-theta);
  const sin = Math.sin(-theta);
  const cx = width / 2;
  const cy = height / 2;

  const short = Math.min(width, height);
  const halfSpan = Math.max(width, height) / 2;
  // Band half-width. Wider plates get a proportionally slimmer band so ultrawide
  // does not read as a uniform fog.
  const bandWidth = short * 0.34;
  const bend = curve * short * 0.42;

  // Noise frequency is tied to the short axis, so the cloud structure keeps the
  // same visual scale at every resolution.
  const f1 = 2.6 / short;
  const f2 = 6.5 / short;
  const f3 = 15.0 / short;

  return {
    at(x: number, y: number): number {
      const dx = x - cx;
      const dy = y - cy;
      const u = dx * cos - dy * sin;
      const v = dx * sin + dy * cos;

      // Parabolic bend along the axis, so the plane curves across the plate.
      const t = u / halfSpan;
      const vb = v - bend * (t * t - 0.33);

      const d = vb / bandWidth;
      const band = Math.exp(-d * d * 1.15);
      if (band < 0.004) return 0;

      const n =
        0.55 * noise(u * f1, vb * f1) +
        0.3 * noise(u * f2 + 41.7, vb * f2 - 13.2) +
        0.15 * clouds(u * f3 - 7.9, vb * f3 + 22.4);

      // Rifts: the noise is allowed to punch dark lanes right through the band.
      // Rifts were cutting all the way to zero and taking the star field with
      // them; the raised base keeps a lane dark without making it empty.
      const modulated = band * (0.55 + 0.6 * (n * 0.5 + 0.5));
      return modulated < 0 ? 0 : modulated > 1 ? 1 : modulated;
    },
  };
}
