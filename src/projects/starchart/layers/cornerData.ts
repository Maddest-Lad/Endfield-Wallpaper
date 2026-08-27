import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, detailScale, plateRegions, type Rect } from '../layout';
import { equatorialToGalactic, formatGalactic, localScale } from '../sky';

/**
 * Two corner readouts in the free space above the field: where the plate sits
 * in the OTHER coordinate system nobody uses for pointing, and what the
 * projection is actually doing to the geometry — real numbers a printed
 * survey plate would carry and a purely decorative corner would not.
 */
export function drawCornerData(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette, view, figures } = data;

  const s = detailScale(width, height);
  const { cornerLeft, cornerRight } = plateRegions(width, height, config.margin);

  const [l, b] = equatorialToGalactic(config.raCenter, config.decCenter);
  const spanning = figures.filter((f) => f.onPlate > 0).length;

  const arcsecPerPx = view.degPerPx * 3600;
  const centreScale = localScale(view, config.raCenter, config.decCenter);
  const edgeDec = Math.max(
    -89.5,
    Math.min(89.5, config.decCenter + (config.decCenter >= 0 ? -1 : 1) * config.fieldOfView * 0.42),
  );
  const edgeScale = localScale(view, config.raCenter, edgeDec);
  const distortion =
    centreScale && edgeScale && centreScale > 1e-6
      ? (edgeScale / centreScale - 1) * 100
      : null;

  const pad = 9 * s;
  const rowH = 14 * s;

  function box(r: Rect, title: string, rows: [string, string][]): void {
    ctx.fillStyle = rgba(palette.ground, 0.9);
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.6 : 0.38);
    ctx.lineWidth = 0.8 * s;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    let y = r.y + pad + rowH * 0.5;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    ctx.font = `${Math.round(10 * s)}px ${MONO}`;
    ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.9 : 0.62);
    ctx.fillText(title, r.x + pad, y);
    y += rowH * 1.15;

    ctx.font = `${Math.round(10.5 * s)}px ${MONO}`;
    const keyX = r.x + pad;
    const valX = r.x + r.w - pad;
    for (const [k, v] of rows) {
      if (y > r.y + r.h - pad * 0.3) break;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.85 : 0.58);
      ctx.fillText(k, keyX, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.88 : 0.75);
      ctx.fillText(v, valX, y);
      y += rowH;
    }
  }

  ctx.save();

  box(cornerLeft, 'POSITION', [
    ['GAL', formatGalactic(l, b)],
    ['SPANS', `${spanning} FIG`],
  ]);

  box(cornerRight, 'OPTICS', [
    ['SCALE', `${arcsecPerPx.toFixed(1)}″/px`],
    ['EDGE Δ', distortion === null ? '—' : `${distortion >= 0 ? '+' : ''}${distortion.toFixed(1)}%`],
  ]);

  ctx.restore();
}
