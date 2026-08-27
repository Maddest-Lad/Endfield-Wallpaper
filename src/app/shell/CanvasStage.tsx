import { useRef, useState, useEffect } from 'react';
import type { AnyProject } from '@core/project/defineProject';
import { useRenderCanvas } from './useRenderCanvas';
import { usePersistConfig } from './usePersistConfig';

export function CanvasStage({ project }: { project: AnyProject }) {
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

  const config = project.useConfig();
  const rendering = useRenderCanvas(canvasRef, containerSize, config, project.render);
  usePersistConfig(project.meta.id, config);

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center p-2 lg:p-6 overflow-hidden">
      <canvas ref={canvasRef} className="shadow-[0_4px_24px_rgba(0,0,0,0.25)]" />

      {rendering && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
          <div className="flex gap-1">
            {/* var(--project-accent), live and kept in sync by ProjectRoute — see AppShell's FAB for the same fix. */}
            <span className="w-1.5 h-5 bg-[var(--project-accent)] animate-[pulse-bar_0.8s_ease-in-out_infinite]" />
            <span className="w-1.5 h-5 bg-[var(--project-accent)] animate-[pulse-bar_0.8s_ease-in-out_0.15s_infinite]" />
            <span className="w-1.5 h-5 bg-[var(--project-accent)] animate-[pulse-bar_0.8s_ease-in-out_0.3s_infinite]" />
          </div>
          <span className="text-sm text-site-mid uppercase tracking-[0.25em] font-sans">
            Processing
          </span>
        </div>
      )}
    </div>
  );
}
