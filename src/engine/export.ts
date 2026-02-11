import type { WallpaperConfig } from './types';
import { renderWallpaper } from './renderer';

export async function exportWallpaper(config: WallpaperConfig): Promise<void> {
  // Create a full-resolution canvas for export
  let canvas: HTMLCanvasElement | OffscreenCanvas;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(config.width, config.height);
  } else {
    canvas = document.createElement('canvas');
  }

  await renderWallpaper(canvas, config);

  // Convert to blob and download
  let blob: Blob;

  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to export canvas'));
      }, 'image/png');
    });
  }

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `endfield-terrain-${config.seed}-${config.width}x${config.height}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
