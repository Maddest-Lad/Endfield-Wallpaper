import { contours } from 'd3-contour';
import type { ContourData } from './types';

export function extractContours(
  heightmap: Float64Array,
  gridWidth: number,
  gridHeight: number,
  thresholdCount: number,
): ContourData[] {
  const generator = contours()
    .size([gridWidth, gridHeight])
    .smooth(true)
    .thresholds(thresholdCount);

  const result = generator(Array.from(heightmap));

  return result.map((c) => ({
    value: c.value,
    coordinates: c.coordinates as number[][][][],
  }));
}
