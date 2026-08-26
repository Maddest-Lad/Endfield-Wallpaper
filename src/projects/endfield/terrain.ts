import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

export interface TerrainConfig {
  width: number;
  height: number;
  seed: string;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

export function generateHeightmap(config: TerrainConfig): Float64Array {
  const { width, height, seed, scale, octaves, persistence, lacunarity } = config;
  const prng = alea(seed);
  const noise2D = createNoise2D(prng);
  const data = new Float64Array(width * height);

  let min = Infinity;
  let max = -Infinity;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      let amplitude = 1;
      let frequency = scale;

      for (let o = 0; o < octaves; o++) {
        value += amplitude * noise2D(x * frequency, y * frequency);
        amplitude *= persistence;
        frequency *= lacunarity;
      }

      const idx = y * width + x;
      data[idx] = value;

      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  // Normalize to [0, 1]
  const range = max - min || 1;
  for (let i = 0; i < data.length; i++) {
    data[i] = (data[i] - min) / range;
  }

  return data;
}
