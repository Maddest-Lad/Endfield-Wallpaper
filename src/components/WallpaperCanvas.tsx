import { useRef, useState, useEffect } from 'react';
import { useGenerateWallpaper } from '../hooks/useGenerateWallpaper';

export function WallpaperCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rendering = useGenerateWallpaper(canvasRef, containerSize);

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      />

      {rendering && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <div className="flex gap-[3px]">
            <span className="w-1 h-3 bg-ef-yellow animate-[pulse-bar_0.8s_ease-in-out_infinite]" />
            <span className="w-1 h-3 bg-ef-yellow animate-[pulse-bar_0.8s_ease-in-out_0.15s_infinite]" />
            <span className="w-1 h-3 bg-ef-yellow animate-[pulse-bar_0.8s_ease-in-out_0.3s_infinite]" />
          </div>
          <span className="text-[10px] text-ef-mid uppercase tracking-[0.25em] font-sans">
            Processing
          </span>
        </div>
      )}
    </div>
  );
}
