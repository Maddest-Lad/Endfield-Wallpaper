import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { detailScale } from '../layout';

/**
 * Trade lanes: the inhabited-space layer. Deliberately unlike the constellation
 * figures — accent-coloured, part dashed, with terminal markers at every node —
 * so the two networks never read as one.
 */
export function drawRoutes(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, data } = rc;
  const { palette, routeNodes, routeEdges } = data;
  if (routeNodes.length === 0) return;

  const s = detailScale(width, height);
  const accent = palette.accent;

  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  for (const e of routeEdges) {
    const a = routeNodes[e.a];
    const b = routeNodes[e.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 2) continue;
    const ux = dx / len;
    const uy = dy / len;
    // Stop clear of the terminal markers at both ends.
    const gap = 5 * s;
    if (gap * 2 >= len) continue;

    ctx.setLineDash(e.dashed ? [6 * s, 4 * s] : []);
    ctx.lineWidth = (e.backbone ? 1.3 : 0.85) * s;
    ctx.strokeStyle = rgba(accent, e.backbone ? 0.62 : 0.3);
    ctx.beginPath();
    ctx.moveTo(a.x + ux * gap, a.y + uy * gap);
    ctx.lineTo(b.x - ux * gap, b.y - uy * gap);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.lineWidth = 1 * s;

  for (const n of routeNodes) {
    const r = (n.hub ? 3.4 : 2.2) * s;
    ctx.strokeStyle = rgba(accent, 0.85);
    ctx.strokeRect(n.x - r, n.y - r, r * 2, r * 2);
    if (n.hub) {
      ctx.strokeStyle = rgba(accent, 0.4);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = rgba(accent, 0.55);
      ctx.fillRect(n.x - r * 0.4, n.y - r * 0.4, r * 0.8, r * 0.8);
    }
  }

  ctx.restore();
}
