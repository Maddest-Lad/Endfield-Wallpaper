import type { AnyProject } from '../project/defineProject';

/** Render a project at its full configured resolution and download it as a PNG. */
export async function exportPng(project: AnyProject): Promise<void> {
  const { width, height } = project.getConfig();

  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');

  // dpr 1: the configured dimensions are already absolute pixels.
  await project.render(canvas, { width, height, dpr: 1, target: 'export' });

  const blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: 'image/png' })
      : await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to export canvas'))), 'image/png');
        });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = project.exportFileName();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
