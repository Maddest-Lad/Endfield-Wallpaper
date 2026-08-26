import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, detailScale, plateRegions } from '../layout';
import { plateIdentity } from '../textContent';

/**
 * The document furniture: a title block naming the plate, its projection, epoch
 * and scale, plus a legend keying the three mark types.
 *
 * Drawn last and over an opaque ground fill, so it always wins against whatever
 * the field put underneath it.
 */
export function drawTitleBlock(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, stars, routeNodes, constellations } = data;

  const s = detailScale(width, height);
  const { title, legend } = plateRegions(width, height, config.margin);
  const id = plateIdentity(rng);

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
  ctx.fillText(id.designation, title.x + pad, y);
  y += rowH * 1.35;

  ctx.strokeStyle = rgba(palette.accent, 0.8);
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(title.x + pad, y - rowH * 0.55);
  ctx.lineTo(title.x + title.w - pad, y - rowH * 0.55);
  ctx.stroke();

  const rows: [string, string][] = [
    ['SURVEY', id.survey],
    ['PROJ', id.projection],
    ['EPOCH', id.epoch],
    ['SCALE', id.scale],
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
  ctx.fillText('MAG 0-4', textX, ly);
  ly += rowH;

  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.6 : 0.4);
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(markX, ly);
  ctx.lineTo(markX + 24 * s, ly);
  ctx.stroke();
  ctx.fillText(`FIGURES ${constellations.length}`, textX, ly);
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
