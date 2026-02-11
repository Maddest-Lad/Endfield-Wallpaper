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

  useGenerateWallpaper(canvasRef, containerSize);

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}
