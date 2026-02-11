import { useRef } from 'react';
import { useGenerateWallpaper } from '../hooks/useGenerateWallpaper';
import { useWallpaperConfig } from '../hooks/useWallpaperConfig';

export function WallpaperCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWallpaperConfig();

  useGenerateWallpaper(canvasRef);

  const aspect = width / height;

  return (
    <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
      {/* Corner bracket decorations on the container */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-ef-border" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-ef-border" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-ef-border" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-ef-border" />

      {/* Small decorative text */}
      <span className="absolute top-5 left-12 text-[8px] text-ef-mid/40 uppercase tracking-[0.3em]">
        TERRAIN_PREVIEW
      </span>
      <span className="absolute bottom-5 right-12 text-[8px] text-ef-mid/40 uppercase tracking-[0.3em] font-mono">
        {width} x {height}
      </span>

      <canvas
        ref={canvasRef}
        className="shadow-lg max-w-full max-h-full"
        style={{ aspectRatio: `${aspect}` }}
      />
    </div>
  );
}
