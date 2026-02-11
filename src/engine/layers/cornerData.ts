import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomInt } from '../../utils/random';

export function drawCornerData(rc: RenderContext): void {
  const { ctx, width, height, palette, rng, config } = rc;

  const fontSize = Math.max(7, Math.round(width / 220));
  const lineH = fontSize * 1.7;
  const margin = Math.round(width * 0.035);

  ctx.save();
  ctx.globalAlpha = 0.4;

  // Top-left: environmental readouts
  drawTopLeftReadouts(ctx, margin, margin, fontSize, lineH, palette, rng);

  // Top-right: coordinates
  drawTopRightCoords(ctx, width - margin, margin, fontSize, lineH, palette, rng);

  // Bottom-left: classification stamp
  drawBottomLeftStamp(ctx, margin, height - margin, fontSize, lineH, palette, rng, config.showCjkText);

  ctx.restore();
}

function drawTopLeftReadouts(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fontSize: number,
  lineH: number,
  palette: { textPrimary: string; textSecondary: string; accent: string },
  rng: () => number,
): void {
  const temp = randomInt(rng, -12, 42);
  const humidity = randomInt(rng, 20, 95);
  const alt = randomInt(rng, 120, 4800);
  const pressure = (950 + rng() * 80).toFixed(1);
  const windSpeed = randomInt(rng, 0, 45);

  const lines = [
    { label: 'T', value: `${temp}\u00B0C` },
    { label: 'H', value: `${humidity}%` },
    { label: 'ALT', value: `${alt.toLocaleString()}m` },
    { label: 'hPa', value: pressure },
    { label: 'WIND', value: `${windSpeed}kt` },
  ];

  // Pick 3-4 of these
  const count = randomInt(rng, 3, 4);

  for (let i = 0; i < count; i++) {
    const line = lines[i];
    const ly = y + i * lineH + lineH;

    ctx.font = fontForText(line.label, fontSize - 1);
    ctx.fillStyle = palette.textSecondary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${line.label}:`, x, ly);

    ctx.font = fontForText(line.value, fontSize, true);
    ctx.fillStyle = palette.textPrimary;
    ctx.fillText(line.value, x + fontSize * 4, ly);
  }
}

function drawTopRightCoords(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fontSize: number,
  lineH: number,
  palette: { textPrimary: string; textSecondary: string },
  rng: () => number,
): void {
  const lat = {
    deg: randomInt(rng, -89, 89),
    min: randomInt(rng, 0, 59),
    sec: (rng() * 60).toFixed(1),
    dir: rng() > 0.5 ? 'N' : 'S',
  };
  const lon = {
    deg: randomInt(rng, -179, 179),
    min: randomInt(rng, 0, 59),
    sec: (rng() * 60).toFixed(1),
    dir: rng() > 0.5 ? 'E' : 'W',
  };

  const lines = [
    `${lat.dir} ${Math.abs(lat.deg)}\u00B0${lat.min}'${lat.sec}"`,
    `${lon.dir} ${Math.abs(lon.deg)}\u00B0${lon.min}'${lon.sec}"`,
    `GRID: ${randomInt(rng, 1, 9)}${String.fromCharCode(65 + randomInt(rng, 0, 7))}-${randomInt(rng, 1, 9)}${String.fromCharCode(65 + randomInt(rng, 0, 7))}`,
  ];

  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    ctx.font = fontForText(lines[i], fontSize);
    ctx.fillStyle = i < 2 ? palette.textPrimary : palette.textSecondary;
    ctx.fillText(lines[i], x, y + lineH + i * lineH);
  }
}

function drawBottomLeftStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fontSize: number,
  lineH: number,
  palette: { textPrimary: string; textSecondary: string; accent: string },
  rng: () => number,
  showCjk: boolean,
): void {
  const id = `EF-${randomInt(rng, 1000, 9999)}`;
  const rev = `REV-${String.fromCharCode(65 + randomInt(rng, 0, 5))}.${randomInt(rng, 1, 9).toString().padStart(2, '0')}`;

  const lines: string[] = [id, rev];
  if (showCjk) {
    lines.push('認証済み');
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  for (let i = lines.length - 1; i >= 0; i--) {
    const ly = y - (lines.length - 1 - i) * lineH;
    ctx.font = fontForText(lines[i], fontSize);
    ctx.fillStyle = palette.textSecondary;
    ctx.fillText(lines[i], x, ly);
  }
}
