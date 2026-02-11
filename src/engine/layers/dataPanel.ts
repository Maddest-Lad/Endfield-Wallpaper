import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';
import { randomPick, randomInt, shuffle } from '../../utils/random';

const PANEL_LINES_EN = [
  ['OPERATION ZONE', 'SECTOR {S}'],
  ['CLASSIFICATION', 'OMEGA'],
  ['AUTH LEVEL', 'LEVEL-{N}'],
  ['STATUS', 'ACTIVE'],
  ['TERRAIN TYPE', 'MOUNTAINOUS'],
  ['SIGNAL', 'ACQUIRED'],
  ['FREQ', '{F}MHz'],
  ['DATUM', 'WGS84'],
];

const PANEL_LINES_JP = [
  '作戦区域',
  '機密等級',
  '認証済み',
  '地形解析',
  '通信確認',
];

export function drawDataPanel(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  const panelW = Math.round(width * 0.18);
  const lineH = Math.max(14, Math.round(height * 0.022));
  const lineCount = randomInt(rng, 5, 7);
  const panelH = lineH * (lineCount + 2) + lineH;
  const margin = Math.round(width * 0.04);

  // Position: bottom-right
  const px = width - margin - panelW;
  const py = height - margin - panelH;

  const fontSize = Math.max(7, Math.round(width / 220));

  ctx.save();

  // Panel background
  ctx.fillStyle = palette.background;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(px, py, panelW, panelH);

  // Panel border
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  ctx.strokeRect(px, py, panelW, panelH);

  // Header bar
  const headerH = lineH + 4;
  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(px, py, panelW, headerH);

  // Header text
  ctx.globalAlpha = 1;
  ctx.font = fontForText('ENDFIELD', fontSize + 1, true, 'endfield');
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ENDFIELD INDUSTRIES', px + 6, py + headerH / 2);

  // Content lines
  ctx.globalAlpha = 0.6;
  const usedLines = shuffle(rng, PANEL_LINES_EN).slice(0, lineCount);

  for (let i = 0; i < usedLines.length; i++) {
    const y = py + headerH + lineH * (i + 0.7);
    const [label, valueTpl] = usedLines[i];

    // Resolve template placeholders
    const value = valueTpl
      .replace('{S}', `${randomInt(rng, 1, 12)}-${String.fromCharCode(65 + randomInt(rng, 0, 7))}`)
      .replace('{N}', `${randomInt(rng, 1, 5)}`)
      .replace('{F}', `${(140 + rng() * 20).toFixed(1)}`);

    ctx.font = fontForText(label, fontSize - 1, false, 'standard');
    ctx.fillStyle = palette.textSecondary;
    ctx.textAlign = 'left';
    ctx.fillText(label, px + 6, y);

    ctx.font = fontForText(value, fontSize, true, 'standard');
    ctx.fillStyle = palette.textPrimary;
    ctx.textAlign = 'right';
    ctx.fillText(value, px + panelW - 6, y);
  }

  // JP label at the bottom
  const jpText = randomPick(rng, PANEL_LINES_JP);
  const jpY = py + headerH + lineH * (usedLines.length + 0.7);
  ctx.globalAlpha = 0.3;
  ctx.font = fontForText(jpText, fontSize + 2);
  ctx.fillStyle = palette.textSecondary;
  ctx.textAlign = 'left';
  ctx.fillText(jpText, px + 6, jpY);

  ctx.restore();
}
