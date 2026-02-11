import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import type { ContourColorMode } from '../../engine/types';

const MODES: { value: ContourColorMode; label: string }[] = [
  { value: 'mono', label: 'Mono' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'fade', label: 'Fade' },
];

export function ContourControls() {
  const contourColorMode = useWallpaperConfig((s) => s.contourColorMode);
  const setConfig = useWallpaperConfig((s) => s.setConfig);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-ef-mid uppercase tracking-widest">Contour Color</span>
      <div className="flex gap-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setConfig({ contourColorMode: m.value })}
            className={`flex-1 text-[9px] uppercase tracking-wider px-2 py-1.5
              border cursor-pointer transition-all
              ${
                contourColorMode === m.value
                  ? 'border-ef-yellow bg-ef-yellow text-ef-dark'
                  : 'border-ef-border text-ef-dark bg-transparent hover:border-ef-mid'
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
