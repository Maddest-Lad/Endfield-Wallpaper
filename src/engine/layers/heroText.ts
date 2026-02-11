import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange, randomPick } from '../../utils/random';

const HERO_WORDS = [
  'ENDFIELD',
  'ARKNIGHTS',
  'TERRAIN',
  'SURVEY',
  'OBSERVE',
];

export function drawHeroText(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  ctx.save();

  const word = randomPick(rng, HERO_WORDS);
  const fontSize = Math.round(width * randomInRange(rng, 0.1, 0.16));

  // Position: offset from center, biased toward lower-left or upper-right
  const posVariant = rng();
  let x: number, y: number;

  if (posVariant < 0.5) {
    x = randomInRange(rng, width * 0.04, width * 0.2);
    y = randomInRange(rng, height * 0.55, height * 0.8);
  } else {
    x = randomInRange(rng, width * 0.4, width * 0.65);
    y = randomInRange(rng, height * 0.2, height * 0.45);
  }

  ctx.font = fontForText(word, fontSize, true);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Shadow/echo layer behind — slightly offset, even fainter
  ctx.fillStyle = palette.textSecondary;
  ctx.globalAlpha = 0.04;
  const offset = Math.round(fontSize * 0.02);
  ctx.fillText(word, x + offset, y + offset);

  // Main text — very faint watermark
  ctx.fillStyle = palette.textPrimary;
  ctx.globalAlpha = 0.06;
  ctx.fillText(word, x, y);

  // Thin underline accent
  const textW = ctx.measureText(word).width;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(x, y + fontSize * 0.45);
  ctx.lineTo(x + textW, y + fontSize * 0.45);
  ctx.stroke();

  ctx.restore();
}
