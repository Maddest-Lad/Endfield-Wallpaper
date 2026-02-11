import type { RenderContext } from '../types';
import { fontForText } from '../../utils/fonts';

export function drawGrid(rc: RenderContext): void {
  const { ctx, width, height, palette } = rc;

  const majorStep = Math.round(width / 8);
  const minorStep = Math.round(majorStep / 4);

  // Minor grid
  ctx.strokeStyle = palette.gridMinor;
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  for (let x = minorStep; x < width; x += minorStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = minorStep; y < height; y += minorStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Major grid
  ctx.strokeStyle = palette.gridMajor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = majorStep; x < width; x += majorStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = majorStep; y < height; y += majorStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Coordinate labels at major intersections
  const labelSize = Math.max(7, Math.round(width / 250));
  ctx.font = fontForText('A', labelSize);
  ctx.fillStyle = palette.gridLabel;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let col = 0;
  for (let x = majorStep; x < width; x += majorStep) {
    let row = 0;
    for (let y = majorStep; y < height; y += majorStep) {
      const label = `${String.fromCharCode(65 + (col % 26))}-${String(row + 1).padStart(2, '0')}`;
      ctx.fillText(label, x + 3, y + 3);
      row++;
    }
    col++;
  }
}
