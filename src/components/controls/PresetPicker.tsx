import { PRESETS } from '../../data/presets';
import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';

export function PresetPicker() {
  const applyPreset = useWallpaperConfig((s) => s.applyPreset);

  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.name}
          onClick={() => applyPreset(p.name)}
          className="text-[10px] uppercase tracking-wider px-2 py-1
            border border-ef-border text-ef-dark bg-transparent
            hover:border-ef-mid hover:bg-ef-dark/5 active:bg-ef-dark/10
            cursor-pointer transition-all"
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
