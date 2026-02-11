import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange, randomInt, shuffle } from '../../utils/random';
import { JP_LABELS, EN_LABELS, DATA_LABELS } from '../../data/textContent';

interface Annotation {
  text: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  bracketed: boolean;
}

export function drawAnnotations(rc: RenderContext): void {
  const { ctx, palette } = rc;

  const annotations = generateAnnotationLayout(rc);

  for (const ann of annotations) {
    ctx.globalAlpha = ann.opacity;
    ctx.font = fontForText(ann.text, ann.size);
    ctx.fillStyle = palette.textSecondary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (ann.bracketed) {
      drawBracketedLabel(ctx, ann.text, ann.x, ann.y, ann.size, palette.frameLine);
    } else {
      ctx.fillText(ann.text, ann.x, ann.y);
    }
  }

  ctx.globalAlpha = 1;
}

function generateAnnotationLayout(rc: RenderContext): Annotation[] {
  const { width, height, rng, config } = rc;
  const annotations: Annotation[] = [];

  // Build pool based on toggles
  let pool: string[] = [...EN_LABELS, ...DATA_LABELS];
  if (config.showCjkText) {
    pool = [...pool, ...JP_LABELS];
  }

  const shuffled = shuffle(rng, pool);
  const count = randomInt(rng, 10, 16);

  // Divide canvas into a loose grid of zones
  const cols = 4;
  const rows = 3;
  const zoneW = width / cols;
  const zoneH = height / rows;

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const zoneCol = i % cols;
    const zoneRow = Math.floor(i / cols) % rows;

    const x = zoneCol * zoneW + randomInRange(rng, zoneW * 0.1, zoneW * 0.8);
    const y = zoneRow * zoneH + randomInRange(rng, zoneH * 0.1, zoneH * 0.8);

    const baseFontSize = Math.max(8, Math.round(width / 180));
    const size = baseFontSize + randomInt(rng, -2, 4);
    const opacity = randomInRange(rng, 0.15, 0.4);
    const bracketed = rng() > 0.65;

    annotations.push({
      text: shuffled[i],
      x,
      y,
      size,
      opacity,
      bracketed,
    });
  }

  return annotations;
}

function drawBracketedLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  lineColor: string,
): void {
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const padding = size * 0.5;
  const bracketH = size * 1.4;
  const bracketArm = size * 0.4;

  // Draw text
  ctx.fillText(text, x + padding, y);

  // Draw brackets
  const prevStroke = ctx.strokeStyle;
  const prevWidth = ctx.lineWidth;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;

  const left = x;
  const right = x + textWidth + padding * 2;
  const top = y - bracketH / 2;
  const bottom = y + bracketH / 2;

  // Left bracket [
  ctx.beginPath();
  ctx.moveTo(left + bracketArm, top);
  ctx.lineTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(left + bracketArm, bottom);
  ctx.stroke();

  // Right bracket ]
  ctx.beginPath();
  ctx.moveTo(right - bracketArm, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right - bracketArm, bottom);
  ctx.stroke();

  ctx.strokeStyle = prevStroke;
  ctx.lineWidth = prevWidth;
}
