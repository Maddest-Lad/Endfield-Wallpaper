import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Slider } from '../ui/Slider';
import type { ContourColorMode } from '../../engine/types';

const MODES: { value: ContourColorMode; label: string }[] = [
  { value: 'mono', label: 'Mono' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'fade', label: 'Fade' },
];

const CONTOUR_COLORS = [
  '#888888', // Default gray
  '#1A1A1A', // Black
  '#C8C8C8', // Light gray
  '#FFE600', // Yellow
  '#FF4444', // Red
  '#00AEEF', // Cyan
];

export function ContourControls() {
  const contourColorMode = useWallpaperConfig((s) => s.contourColorMode);
  const contourGlow = useWallpaperConfig((s) => s.contourGlow) ?? 0;
  const contourColor = useWallpaperConfig((s) => s.contourColor) ?? '#888888';
  const setConfig = useWallpaperConfig((s) => s.setConfig);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-ef-mid uppercase tracking-widest">Contour Mode</span>
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

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-ef-mid uppercase tracking-widest">Line Color</span>
        <div className="flex gap-1.5">
          {CONTOUR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setConfig({ contourColor: color })}
              className={`w-6 h-6 border cursor-pointer transition-all ${
                contourColor === color ? 'border-ef-dark scale-110' : 'border-ef-border hover:border-ef-mid'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Slider
        label="Glow"
        value={contourGlow}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => setConfig({ contourGlow: v })}
        displayValue={contourGlow === 0 ? 'Off' : contourGlow.toFixed(2)}
      />
    </div>
  );
}
