import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
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
import { starDesignation, magText } from '../textContent';

/**
 * Real designations beside the stars that carry one, some on leader lines.
 *
 * Candidates are taken brightest-first and only from stars that actually have a
 * designation, which is how a printed chart chooses too — roughly 4,800 of the
 * catalogue's 41,411 entries have one, and they are overwhelmingly the bright
 * ones. Fainter stars stay anonymous rather than being given an invented number.
 *
 * Counts scale with plate AREA over the squared detail scale, so an ultrawide
 * gets proportionally more labels rather than the same handful stretched out.
 */
export function drawLabels(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, stars, figures } = data;

  const s = detailScale(width, height);
  const { bounds, title, legend, cornerLeft, cornerRight } = plateRegions(
    width,
    height,
    config.margin,
  );
  const areaFactor = (width * height) / (s * s) / (1920 * 1080);
  const fontSize = Math.round(9.5 * s);
  const lineH = fontSize * 1.2;

  // Latin genitives, so a Bayer letter reads `α Orionis` and not `α Ori`.
  const genitive = new Map(figures.map((f) => [f.id, f.gen]));

  interface Candidate {
    star: Star;
    text: string;
  }
  const targets: Candidate[] = [];
  for (const st of stars) {
    if (targets.length >= 200) break;
    const text = starDesignation(st, genitive);
    if (text) targets.push({ star: st, text });
  }

  const wanted = Math.max(2, Math.round((5 + config.labelDensity * 26) * areaFactor));

  ctx.save();
  ctx.font = `${fontSize}px ${MONO}`;
  ctx.textBaseline = 'middle';

  // Reserved only while the furniture is enabled — it draws over this layer.
  const taken: Rect[] = [
    ...(config.showTitleBlock ? [title, legend] : []),
    ...(config.showDataBlocks ? [cornerLeft, cornerRight] : []),
  ];
  let drawn = 0;

  for (const { star: st, text } of targets) {
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

    // The brightest few also get their magnitude, set smaller underneath — the
    // detail that makes the plate read as a measurement rather than a picture.
    if (st.mag < 3.2 && rng() < 0.75) {
      const sub = magText(st.mag);
      ctx.font = `${Math.round(8 * s)}px ${MONO}`;
      const subPlaced = placeLabel(ctx, sub, placed.x, placed.y + lineH * 0.85, placed.align, bounds, lineH);
      if (subPlaced) {
        ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.7 : 0.5);
        ctx.fillText(sub, subPlaced.x, subPlaced.y);
        const sw = ctx.measureText(sub).width;
        taken.push({
          x: subPlaced.align === 'left' ? subPlaced.x : subPlaced.x - sw,
          y: subPlaced.y - lineH / 2,
          w: sw,
          h: lineH,
        });
      }
      ctx.font = `${fontSize}px ${MONO}`;
    }

    drawn++;
  }

  ctx.restore();
}
