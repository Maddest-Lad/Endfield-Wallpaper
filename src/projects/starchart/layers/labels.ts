import type { RenderContext } from '@core/project/types';
import { randomInRange, shuffle } from '@core/utils/random';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import type { Star } from '../catalog';
import { rgba } from '../palette';
import {
  MONO,
  detailScale,
  placeLabel,
  plateRegions,
  rectsOverlap,
  type Rect,
} from '../layout';
import { designator, sectorLabel } from '../textContent';

/**
 * Catalogue designators beside notable stars, some on leader lines, plus sector
 * labels dropped into the graticule cells.
 *
 * Counts scale with plate AREA over the squared detail scale, so an ultrawide
 * gets proportionally more labels rather than the same handful stretched out.
 */
export function drawLabels(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, beacons, stars } = data;

  const s = detailScale(width, height);
  const { bounds, title, legend } = plateRegions(width, height, config.margin);
  const areaFactor = (width * height) / (s * s) / (1920 * 1080);
  const fontSize = Math.round(9.5 * s);
  const lineH = fontSize * 1.2;

  const targets: Star[] = [
    ...shuffle(rng, beacons),
    ...shuffle(rng, stars.filter((st) => st.mag === 1)),
  ];
  const wanted = Math.max(2, Math.round((5 + config.labelDensity * 28) * areaFactor));

  ctx.save();
  ctx.font = `${fontSize}px ${MONO}`;
  ctx.textBaseline = 'middle';

  // Reserved only while the furniture is enabled — it draws over this layer.
  const taken: Rect[] = config.showTitleBlock ? [title, legend] : [];
  let drawn = 0;

  for (const st of targets) {
    if (drawn >= wanted) break;

    const useLeader = rng() < 0.32;
    const dirX = st.x > width * 0.55 ? -1 : 1;
    const dirY = rng() < 0.5 ? -1 : 1;

    let tx: number;
    let ty: number;
    let elbow: [number, number] | null = null;

    if (useLeader) {
      const run = randomInRange(rng, 18, 40) * s;
      const mx = st.x + dirX * run;
      const my = st.y + dirY * run;
      elbow = [mx, my];
      tx = mx + dirX * randomInRange(rng, 14, 30) * s;
      ty = my;
    } else {
      tx = st.x + dirX * (st.r + 7 * s);
      ty = st.y + (rng() < 0.5 ? -1 : 1) * 1.5 * s;
    }

    const text = designator(rng);
    const align = dirX > 0 ? 'left' : 'right';
    const placed = placeLabel(ctx, text, tx, ty, align, bounds, lineH);
    if (!placed) continue;

    const w = ctx.measureText(text).width;
    const box: Rect = {
      x: placed.align === 'left' ? placed.x : placed.x - w,
      y: placed.y - lineH / 2,
      w,
      h: lineH,
    };
    if (taken.some((t) => rectsOverlap(box, t, 3 * s))) continue;
    taken.push(box);

    if (elbow) {
      ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.6 : 0.4);
      ctx.lineWidth = 0.7 * s;
      const len = Math.hypot(elbow[0] - st.x, elbow[1] - st.y);
      const ux = (elbow[0] - st.x) / len;
      const uy = (elbow[1] - st.y) / len;
      const gap = st.r + 3.5 * s;
      ctx.beginPath();
      ctx.moveTo(st.x + ux * gap, st.y + uy * gap);
      ctx.lineTo(elbow[0], elbow[1]);
      ctx.lineTo(tx - (dirX > 0 ? 2 * s : -2 * s), ty);
      ctx.stroke();
    }

    ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.82 : 0.66);
    ctx.textAlign = placed.align;
    ctx.fillText(text, placed.x, placed.y);
    drawn++;
  }

  // Sector labels: sparse, faint, sitting in the empty graticule cells.
  const sectors = Math.max(2, Math.round((3 + config.labelDensity * 5) * areaFactor));
  ctx.font = `${Math.round(10 * s)}px ${MONO}`;
  ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.6 : 0.38);
  for (let i = 0; i < sectors; i++) {
    const x = randomInRange(rng, bounds.left + 40 * s, bounds.right - 40 * s);
    const y = randomInRange(rng, bounds.top + 20 * s, bounds.bottom - 20 * s);
    const text = sectorLabel(rng);
    const placed = placeLabel(ctx, text, x, y, 'center', bounds, 12 * s);
    if (!placed) continue;
    const w = ctx.measureText(text).width;
    const box: Rect = { x: placed.x - w / 2, y: placed.y - 6 * s, w, h: 12 * s };
    if (taken.some((t) => rectsOverlap(box, t, 4 * s))) continue;
    taken.push(box);
    ctx.textAlign = 'center';
    ctx.fillText(text, placed.x, placed.y);
  }

  ctx.restore();
}
