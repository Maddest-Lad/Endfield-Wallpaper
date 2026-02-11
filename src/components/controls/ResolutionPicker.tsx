import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Select } from '../ui/Select';
import type { ResolutionPreset } from '../../engine/types';

const presetOptions = [
  { value: '1080p', label: '1920 x 1080' },
  { value: '1440p', label: '2560 x 1440' },
  { value: '4k', label: '3840 x 2160' },
  { value: 'phone', label: '1170 x 2532' },
  { value: 'ultrawide', label: '3440 x 1440' },
  { value: 'custom', label: 'CUSTOM' },
];

export function ResolutionPicker() {
  const { preset, width, height, setPreset, setConfig } = useWallpaperConfig();

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Resolution"
        value={preset}
        options={presetOptions}
        onChange={(v) => setPreset(v as ResolutionPreset)}
      />
      {preset === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={width}
            onChange={(e) => setConfig({ width: parseInt(e.target.value) || 1920 })}
            className="w-20 bg-transparent border border-ef-border text-xs text-ef-dark px-2 py-1 font-mono focus:border-ef-yellow focus:outline-none"
          />
          <span className="text-[10px] text-ef-mid">x</span>
          <input
            type="number"
            value={height}
            onChange={(e) => setConfig({ height: parseInt(e.target.value) || 1080 })}
            className="w-20 bg-transparent border border-ef-border text-xs text-ef-dark px-2 py-1 font-mono focus:border-ef-yellow focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
