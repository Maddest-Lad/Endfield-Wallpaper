import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Slider } from '../ui/Slider';
import { ColorPicker } from '../ui/ColorPicker';
import type { ContourColorMode } from '../../engine/types';

const MODES: { value: ContourColorMode; label: string }[] = [
  { value: 'mono', label: 'Mono' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'fade', label: 'Fade' },
];

export function ContourControls() {
  const contourColorMode = useWallpaperConfig((s) => s.contourColorMode);
  const contourGlow = useWallpaperConfig((s) => s.contourGlow) ?? 0;
  const contourColor = useWallpaperConfig((s) => s.contourColor) ?? '#888888';
  const setConfig = useWallpaperConfig((s) => s.setConfig);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-ef-mid uppercase tracking-widest">Contour Mode</span>
        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setConfig({ contourColorMode: m.value })}
              className={`flex-1 text-[10px] uppercase tracking-wider px-2 py-1.5
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

      <ColorPicker
        label="Line Color"
        value={contourColor}
        onChange={(color) => setConfig({ contourColor: color })}
      />

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
