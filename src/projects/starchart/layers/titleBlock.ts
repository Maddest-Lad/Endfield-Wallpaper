import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, detailScale, plateRegions } from '../layout';
import { plateIdentity, plateDesignation } from '../textContent';
import { formatRa, formatDec, PROJECTION_LABELS } from '../sky';
import { nearestRegion } from '../regions';

/**
 * The document furniture: a title block naming the plate, where it points, how
 * it was projected and how deep it goes, plus a legend keying the mark types.
 *
 * Every row except SURVEY is now a real property of the plate rather than a
 * plausible-looking number — the centre coordinates are the actual J2000
 * pointing, FIELD is the real angular width, and LIM MAG is the cut that
 * produced the star count beside it.
 *
 * Drawn last and over an opaque ground fill, so it always wins against whatever
 * the field put underneath it.
 */
export function drawTitleBlock(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, stars, routeNodes, figures } = data;

  const s = detailScale(width, height);
  const { title, legend } = plateRegions(width, height, config.margin);
  const id = plateIdentity(rng);
  // Name the plate for the constellation that dominates it, falling back to the
  // named region and then to nothing.
  //
  // Ranked by how much line-work is actually in frame, NOT by the fraction of
  // each figure that made it. `figures` is sorted by that fraction, so taking
  // the first one over a threshold named a plate centred on Betelgeuse after
  // Canis Minor — a two-star figure fully in frame scores 1.0, while Orion
  // filling the plate but running off two edges scores less.
  let dominant: (typeof figures)[number] | undefined;
  for (const f of figures) {
    if (f.onPlate >= 4 && (!dominant || f.onPlate > dominant.onPlate)) dominant = f;
  }
  const region = nearestRegion(config.raCenter, config.decCenter);
  const designation = plateDesignation(
    dominant?.id ?? region?.name.slice(0, 3) ?? null,
    config.raCenter,
    config.decCenter,
  );

  ctx.save();
  ctx.lineCap = 'butt';

  // --- Title block ---
  ctx.fillStyle = rgba(palette.ground, 0.9);
  ctx.fillRect(title.x, title.y, title.w, title.h);
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.75 : 0.5);
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(title.x, title.y, title.w, title.h);

  const pad = 11 * s;
  const rowH = 15 * s;
  let y = title.y + pad + rowH * 0.5;

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  ctx.font = `${Math.round(15 * s)}px ${MONO}`;
  ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.95 : 0.9);
  ctx.fillText(designation, title.x + pad, y);
  y += rowH * 1.35;

  ctx.strokeStyle = rgba(palette.accent, 0.8);
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(title.x + pad, y - rowH * 0.55);
  ctx.lineTo(title.x + title.w - pad, y - rowH * 0.55);
  ctx.stroke();

  const rows: [string, string][] = [
    ['SURVEY', region ? region.name.toUpperCase() : id.survey],
    ['R.A.', formatRa(config.raCenter)],
    ['DEC.', formatDec(config.decCenter)],
    ['PROJ', PROJECTION_LABELS[config.projection]],
    ['FIELD', `${config.fieldOfView.toFixed(0)}° × ${((config.fieldOfView * Math.min(width, height)) / Math.max(width, height)).toFixed(0)}°`],
    ['EPOCH', 'J2000.0'],
    ['LIM MAG', `${config.limitingMag.toFixed(1)}`],
    ['OBJ', `${stars.length}`],
  ];

  ctx.font = `${Math.round(11 * s)}px ${MONO}`;
  const keyX = title.x + pad;
  const valX = title.x + title.w - pad;
  for (const [k, v] of rows) {
    if (y > title.y + title.h - pad * 0.4) break;
    ctx.textAlign = 'left';
    ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.9 : 0.62);
    ctx.fillText(k, keyX, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.9 : 0.78);
    // Clip long values to the block rather than letting them run past the rule.
    let text = v;
    const maxW = title.w - pad * 2 - ctx.measureText(k).width - 8 * s;
    while (text.length > 3 && ctx.measureText(text).width > maxW) {
      text = text.slice(0, -1);
    }
    ctx.fillText(text, valX, y);
    y += rowH * 0.9;
  }

  // --- Legend ---
  ctx.fillStyle = rgba(palette.ground, 0.9);
  ctx.fillRect(legend.x, legend.y, legend.w, legend.h);
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.7 : 0.42);
  ctx.lineWidth = 0.9 * s;
  ctx.strokeRect(legend.x, legend.y, legend.w, legend.h);

  ctx.textAlign = 'left';
  ctx.font = `${Math.round(11 * s)}px ${MONO}`;
  const lx = legend.x + pad;
  const markX = lx + 2 * s;
  const textX = lx + 32 * s;
  let ly = legend.y + pad + rowH * 0.5;

  ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.9 : 0.62);
  ctx.fillText('LEGEND', lx, ly);
  ly += rowH * 1.1;

  // Magnitude key: three dots of decreasing size.
  ctx.fillStyle = rgba(palette.star, 0.95);
  for (let i = 0; i < 3; i++) {
    const r = (3 - i) * 1.3 * s;
    ctx.beginPath();
    ctx.arc(markX + i * 11 * s, ly, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.88 : 0.72);
  ctx.fillText(`MAG ≤ ${config.limitingMag.toFixed(1)}`, textX, ly);
  ly += rowH;

  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.6 : 0.4);
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(markX, ly);
  ctx.lineTo(markX + 24 * s, ly);
  ctx.stroke();
  ctx.fillText(`FIGURES ${figures.filter((f) => f.coverage > 0.15).length}`, textX, ly);
  ly += rowH;

  ctx.strokeStyle = rgba(palette.accent, 0.85);
  ctx.lineWidth = 1.2 * s;
  ctx.setLineDash([5 * s, 3 * s]);
  ctx.beginPath();
  ctx.moveTo(markX, ly);
  ctx.lineTo(markX + 24 * s, ly);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText(`LANES ${routeNodes.length}`, textX, ly);
  ly += rowH;

  if (ly < legend.y + legend.h - pad * 0.3) {
    ctx.font = `${Math.round(10 * s)}px ${MONO}`;
    ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.8 : 0.5);
    let note = id.note;
    const maxW = legend.w - pad * 2;
    while (note.length > 3 && ctx.measureText(note).width > maxW) {
      note = note.slice(0, -1);
    }
    ctx.fillText(note, lx, ly);
  }

  ctx.restore();
}
