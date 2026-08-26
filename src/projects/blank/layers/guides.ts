import type { RenderContext } from '@core/project/types';
import type { BlankConfig } from '../config';

/** Margin rule and a centre crosshair, so an empty canvas still reads as a canvas. */
export function drawGuides(rc: RenderContext<BlankConfig, void>): void {
  const { ctx, width, height, config } = rc;

  const inset = Math.round(config.margin * Math.min(width, height));
  const arm = Math.round(Math.min(width, height) * 0.03);
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.strokeStyle = config.ink;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;

  ctx.strokeRect(inset + 0.5, inset + 0.5, width - inset * 2 - 1, height - inset * 2 - 1);

  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();
  ctx.restore();
}
