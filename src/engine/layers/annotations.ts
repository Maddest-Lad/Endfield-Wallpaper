import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange, randomInt, shuffle } from '../../utils/random';
import { JP_LABELS, EN_LABELS, DATA_LABELS, ENDFIELD_LABELS } from '../../data/textContent';

type FontStyle = 'standard' | 'endfield' | 'cjk';

interface Annotation {
  text: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  bracketed: boolean;
  fontStyle: FontStyle;
}

export function drawAnnotations(rc: RenderContext): void {
  const { ctx, palette } = rc;

  const annotations = generateAnnotationLayout(rc);

  for (const ann of annotations) {
    ctx.font = fontForText(ann.text, ann.size, false, ann.fontStyle === 'cjk' ? 'auto' : ann.fontStyle);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Draw a subtle backdrop to separate text from contour lines
    const metrics = ctx.measureText(ann.text);
    const pad = ann.size * 0.4;
    const bgX = ann.bracketed ? ann.x - pad * 0.3 : ann.x - pad;
    const bgW = metrics.width + pad * (ann.bracketed ? 3.2 : 2);
    const bgH = ann.size * 1.6;

    ctx.globalAlpha = ann.opacity * 0.5;
    ctx.fillStyle = palette.background;
    ctx.fillRect(bgX, ann.y - bgH / 2, bgW, bgH);

    ctx.globalAlpha = ann.opacity;
    ctx.fillStyle = palette.textSecondary;

    if (ann.bracketed) {
      drawBracketedLabel(ctx, ann.text, ann.x, ann.y, ann.size, palette.frameLine);
    } else {
      ctx.fillText(ann.text, ann.x, ann.y);
    }
  }

  ctx.globalAlpha = 1;
}

interface TaggedLabel {
  text: string;
  fontStyle: FontStyle;
}

function generateAnnotationLayout(rc: RenderContext): Annotation[] {
  const { width, height, rng } = rc;
  const annotations: Annotation[] = [];

  // Build tagged pool — always include all three text styles
  const pool: TaggedLabel[] = [
    ...EN_LABELS.map((t) => ({ text: t, fontStyle: 'standard' as const })),
    ...DATA_LABELS.map((t) => ({ text: t, fontStyle: 'standard' as const })),
    ...ENDFIELD_LABELS.map((t) => ({ text: t, fontStyle: 'endfield' as const })),
    ...JP_LABELS.map((t) => ({ text: t, fontStyle: 'cjk' as const })),
  ];

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
    const opacity = randomInRange(rng, 0.25, 0.55);
    const bracketed = rng() > 0.65;

    annotations.push({
      text: shuffled[i].text,
      x,
      y,
      size,
      opacity,
      bracketed,
      fontStyle: shuffled[i].fontStyle,
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
