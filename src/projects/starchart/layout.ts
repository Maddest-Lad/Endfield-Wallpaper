/**
 * Composition helpers. Everything here works in LOGICAL pixels — the pipeline
 * has already applied the device-pixel-ratio transform.
 */

/** Generic-family-only monospace stack: this project ships no font files. */
export const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

/**
 * Detail scale. 1080p is the reference plate; a 4K render is the same drawing at
 * twice the size, so line weights, glyph sizes and star radii all multiply by this
 * while counts-per-area divide by its square.
 */
export function detailScale(width: number, height: number): number {
  return Math.min(width, height) / 1080;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The safe area: nothing textual may be drawn outside it. */
export function safeBounds(width: number, height: number, margin: number): Bounds {
  const inset = margin * Math.min(width, height);
  return { left: inset, top: inset, right: width - inset, bottom: height - inset };
}

export type TextAlign = 'left' | 'right' | 'center';

export interface Placed {
  x: number;
  y: number;
  align: TextAlign;
}

/**
 * Fit a single line inside `b`, flipping its alignment about the anchor if that
 * rescues it. Returns null when the label cannot fit — callers must skip rather
 * than draw clipped text.
 *
 * `ctx.font` must already be set: the width measurement depends on it.
 */
export function placeLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: TextAlign,
  b: Bounds,
  lineHeight: number,
): Placed | null {
  if (y - lineHeight < b.top || y + lineHeight > b.bottom) return null;

  const w = ctx.measureText(text).width;
  if (w > b.right - b.left) return null;

  const spanFor = (a: TextAlign): [number, number] => {
    if (a === 'left') return [x, x + w];
    if (a === 'right') return [x - w, x];
    return [x - w / 2, x + w / 2];
  };

  const order: TextAlign[] =
    align === 'left' ? ['left', 'right'] : align === 'right' ? ['right', 'left'] : ['center'];

  for (const a of order) {
    const [l, r] = spanFor(a);
    if (l >= b.left && r <= b.right) return { x, y, align: a };
  }
  return null;
}

/** Draw a label only if it fits. Returns whether it was drawn. */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: TextAlign,
  b: Bounds,
  lineHeight: number,
): boolean {
  const placed = placeLabel(ctx, text, x, y, align, b, lineHeight);
  if (!placed) return false;
  ctx.textAlign = placed.align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, placed.x, placed.y);
  return true;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Filled arrowhead pointing along (dx, dy), used by the dimension callouts. */
export function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  size: number,
): void {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - ux * size + px * size * 0.34, y - uy * size + py * size * 0.34);
  ctx.lineTo(x - ux * size - px * size * 0.34, y - uy * size - py * size * 0.34);
  ctx.closePath();
  ctx.fill();
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect, pad: number): boolean {
  return (
    a.x - pad < b.x + b.w &&
    a.x + a.w + pad > b.x &&
    a.y - pad < b.y + b.h &&
    a.y + a.h + pad > b.y
  );
}

/**
 * Where the plate furniture sits. Shared so the detail insets and the annotation
 * layers can keep clear of the title block and legend, which draw last and would
 * otherwise cover them.
 */
export function plateRegions(
  width: number,
  height: number,
  margin: number,
): { bounds: Bounds; title: Rect; legend: Rect } {
  const b = safeBounds(width, height, margin);
  const s = detailScale(width, height);
  const pad = 11 * s;

  // Sized around legible type rather than the other way round: an 8px label
  // block at 100% is noise, not information.
  const titleW = clamp(Math.min(width, height) * 0.33, 250 * s, 390 * s);
  const titleH = 122 * s;
  const title: Rect = {
    x: b.right - pad - titleW,
    y: b.bottom - pad - titleH,
    w: titleW,
    h: titleH,
  };

  const legendW = clamp(Math.min(width, height) * 0.23, 195 * s, 280 * s);
  const legendH = 100 * s;
  const legend: Rect = {
    x: b.left + pad,
    y: b.bottom - pad - legendH,
    w: legendW,
    h: legendH,
  };

  return { bounds: b, title, legend };
}

/** Rectangle with four inward corner ticks — the "detail inset" idiom. */
export function cornerTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  arm: number,
): void {
  const corners: [number, number, number, number][] = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  ctx.beginPath();
  for (const [cx, cy, sx, sy] of corners) {
    ctx.moveTo(cx + sx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * arm);
  }
  ctx.stroke();
}
