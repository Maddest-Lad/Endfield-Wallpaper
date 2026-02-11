import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInRange } from '../../utils/random';

export function drawAccents(rc: RenderContext): void {
  drawYellowBars(rc);
  drawHazardStripes(rc);
  drawCmykDots(rc);
  drawHatchingPatches(rc);
  drawScatteredCrosshairs(rc);
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

  // Chevron arrows along left edge of primary bar
  const chevronCount = 4 + Math.floor(rng() * 3); // 4-6
  const chevronH = barHeight * 0.6;
  const chevronW = chevronH * 0.5;
  const chevronSpacing = chevronW * 1.8;
  const chevronStartX = barX + chevronH * 0.3;

  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = Math.max(1, barHeight * 0.08);
  ctx.globalAlpha = 0.5;
  for (let c = 0; c < chevronCount; c++) {
    const cx = chevronStartX + c * chevronSpacing;
    const cy = topBarY + barHeight / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - chevronH / 2);
    ctx.lineTo(cx + chevronW, cy);
    ctx.lineTo(cx, cy + chevronH / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Text on the bar
  const textSize = Math.max(7, Math.round(barHeight * 0.75));
  ctx.font = fontForText('ENDFIELD', textSize, true, 'endfield');
  ctx.fillStyle = '#1A1A1A';
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

function drawHatchingPatches(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;
  const count = 3 + Math.floor(rng() * 3); // 3-5

  for (let i = 0; i < count; i++) {
    // Patch dimensions: 3-8% of canvas width, aspect 0.5:1 to 1:1
    const patchW = Math.round(width * randomInRange(rng, 0.03, 0.08));
    const patchH = Math.round(patchW * randomInRange(rng, 0.5, 1.0));

    // Bias placement toward edges
    let x: number, y: number;
    const edgeBias = rng();
    if (edgeBias < 0.25) {
      x = randomInRange(rng, width * 0.05, width * 0.85);
      y = randomInRange(rng, height * 0.04, height * 0.15);
    } else if (edgeBias < 0.5) {
      x = randomInRange(rng, width * 0.75, width * 0.92);
      y = randomInRange(rng, height * 0.1, height * 0.85);
    } else if (edgeBias < 0.75) {
      x = randomInRange(rng, width * 0.05, width * 0.85);
      y = randomInRange(rng, height * 0.8, height * 0.92);
    } else {
      x = randomInRange(rng, width * 0.03, width * 0.15);
      y = randomInRange(rng, height * 0.1, height * 0.85);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, patchW, patchH);
    ctx.clip();

    // Diagonal parallel lines at 45 degrees
    const lineSpacing = Math.max(3, Math.round(width / 350));
    ctx.strokeStyle = palette.frameLine;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = randomInRange(rng, 0.12, 0.25);

    ctx.beginPath();
    for (let d = -patchH; d < patchW + patchH; d += lineSpacing) {
      ctx.moveTo(x + d, y + patchH);
      ctx.lineTo(x + d + patchH, y);
    }
    ctx.stroke();

    ctx.restore();
  }
}

function drawScatteredCrosshairs(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;
  const count = 8 + Math.floor(rng() * 5); // 8-12
  const armLength = Math.max(3, Math.round(width * 0.006));
  const minDist = width * 0.08;
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0;
    for (let attempt = 0; attempt < 5; attempt++) {
      x = randomInRange(rng, width * 0.04, width * 0.96);
      y = randomInRange(rng, height * 0.04, height * 0.96);

      const valid = positions.every(
        (p) => Math.hypot(p.x - x, p.y - y) > minDist
      );
      if (valid) break;
    }

    positions.push({ x, y });

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = Math.max(1, Math.round(width / 1200));
    ctx.globalAlpha = randomInRange(rng, 0.2, 0.35);

    ctx.beginPath();
    ctx.moveTo(x - armLength, y);
    ctx.lineTo(x + armLength, y);
    ctx.moveTo(x, y - armLength);
    ctx.lineTo(x, y + armLength);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawSmallAccentMarks(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;
  const markSize = Math.max(4, Math.round(width / 350));

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
        x = randomInRange(rng, width * 0.03, width * 0.08);
        y = randomInRange(rng, height * 0.1, height * 0.9);
        break;
    }

    const isHatched = rng() > 0.5;

    // Draw diamond (rotated square)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);

    if (isHatched) {
      // Hatched diamond: outline + diagonal lines inside
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(-markSize / 2, -markSize / 2, markSize, markSize);

      ctx.save();
      ctx.beginPath();
      ctx.rect(-markSize / 2, -markSize / 2, markSize, markSize);
      ctx.clip();

      const spacing = Math.max(2, markSize / 4);
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let d = -markSize; d < markSize * 2; d += spacing) {
        ctx.moveTo(-markSize / 2 + d, markSize / 2);
        ctx.lineTo(-markSize / 2 + d + markSize, -markSize / 2);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      // Solid diamond
      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(-markSize / 2, -markSize / 2, markSize, markSize);
    }

    ctx.restore();
  }
}
