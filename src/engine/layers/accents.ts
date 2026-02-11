import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange } from '../../utils/random';

export function drawAccents(rc: RenderContext): void {
  drawYellowBars(rc);
  drawHazardStripes(rc);
  drawCmykDots(rc);
  drawSmallAccentMarks(rc);
}

function drawYellowBars(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  const barHeight = Math.round(height * 0.012);
  const topBarY = Math.round(height * 0.02);

  // Primary top bar — partial width, offset
  const barWidth = width * randomInRange(rng, 0.55, 0.8);
  const barX = width * randomInRange(rng, 0, 0.15);

  ctx.fillStyle = palette.accent;
  ctx.fillRect(barX, topBarY, barWidth, barHeight);

  // Text on the bar
  const textSize = Math.max(7, Math.round(barHeight * 0.75));
  ctx.font = fontForText('ENDFIELD', textSize, true);
  ctx.fillStyle = rc.config.theme === 'dark' ? '#1A1A1A' : '#1A1A1A';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARKNIGHTS: ENDFIELD', barX + barWidth - textSize * 0.5, topBarY + barHeight / 2);

  // Secondary bottom bar — thinner, different width
  const bottomBarH = Math.round(barHeight * 0.6);
  const bottomBarY = height - topBarY - bottomBarH;
  const bottomBarW = width * randomInRange(rng, 0.3, 0.5);
  const bottomBarX = width - bottomBarW - barX;

  ctx.fillStyle = palette.accent;
  ctx.fillRect(bottomBarX, bottomBarY, bottomBarW, bottomBarH);
}

function drawHazardStripes(rc: RenderContext): void {
  const { ctx, width, height, palette } = rc;

  const patchW = Math.round(width * 0.06);
  const patchH = Math.round(height * 0.018);
  const stripeW = Math.round(patchH * 0.7);

  // Position in a corner
  const margin = Math.round(width * 0.025);
  const x = width - margin - patchW;
  const y = height - margin - patchH;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, patchW, patchH);
  ctx.clip();

  // Fill yellow base
  ctx.fillStyle = palette.accent;
  ctx.fillRect(x, y, patchW, patchH);

  // Draw diagonal black stripes
  ctx.fillStyle = '#1A1A1A';
  for (let sx = -patchH; sx < patchW + patchH; sx += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x + sx, y + patchH);
    ctx.lineTo(x + sx + stripeW, y + patchH);
    ctx.lineTo(x + sx + patchH + stripeW, y);
    ctx.lineTo(x + sx + patchH, y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawCmykDots(rc: RenderContext): void {
  const { ctx, width, height } = rc;

  const dotR = Math.max(2, Math.round(width / 800));
  const spacing = dotR * 3;
  const startX = Math.round(width * 0.03);
  const startY = height - Math.round(height * 0.035);

  const colors = ['#00AEEF', '#EC008C', '#FFE600', '#1A1A1A'];

  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(startX + i * spacing, startY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmallAccentMarks(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  // Small yellow squares scattered near edges
  const markSize = Math.max(3, Math.round(width / 400));
  ctx.fillStyle = palette.accent;

  for (let i = 0; i < 4; i++) {
    const edge = Math.floor(rng() * 4);
    let x: number, y: number;

    switch (edge) {
      case 0: // top
        x = randomInRange(rng, width * 0.1, width * 0.9);
        y = randomInRange(rng, height * 0.03, height * 0.08);
        break;
      case 1: // right
        x = randomInRange(rng, width * 0.92, width * 0.97);
        y = randomInRange(rng, height * 0.1, height * 0.9);
        break;
      case 2: // bottom
        x = randomInRange(rng, width * 0.1, width * 0.9);
        y = randomInRange(rng, height * 0.92, height * 0.97);
        break;
      default: // left
        x = randomInRange(rng, width * 0.03, height * 0.08);
        y = randomInRange(rng, height * 0.1, height * 0.9);
        break;
    }

    ctx.fillRect(x, y, markSize, markSize);
  }
}
