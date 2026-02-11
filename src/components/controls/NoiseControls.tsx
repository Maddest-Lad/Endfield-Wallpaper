import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Slider } from '../ui/Slider';

export function NoiseControls() {
  const { seed, noiseScale, octaves, persistence, contourLevels, paperGrain, setConfig } =
    useWallpaperConfig();

  return (
    <div className="flex flex-col gap-3">
      {/* Seed input */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-ef-mid uppercase tracking-widest">Seed</span>
        <input
          type="text"
          value={seed}
          onChange={(e) => setConfig({ seed: e.target.value })}
          className="bg-transparent border border-ef-border text-xs text-ef-dark px-2 py-1 font-mono focus:border-ef-yellow focus:outline-none w-full"
        />
      </div>

      <Slider
        label="Scale"
        value={noiseScale}
        min={0.002}
        max={0.02}
        step={0.001}
        onChange={(v) => setConfig({ noiseScale: v })}
        displayValue={noiseScale.toFixed(3)}
      />

      <Slider
        label="Octaves"
        value={octaves}
        min={1}
        max={6}
        step={1}
        onChange={(v) => setConfig({ octaves: v })}
      />

      <Slider
        label="Persistence"
        value={persistence}
        min={0.2}
        max={0.8}
        step={0.05}
        onChange={(v) => setConfig({ persistence: v })}
        displayValue={persistence.toFixed(2)}
      />

      <Slider
        label="Contour Levels"
        value={contourLevels}
        min={8}
        max={40}
        step={1}
        onChange={(v) => setConfig({ contourLevels: v })}
      />

      <Slider
        label="Paper Grain"
        value={paperGrain}
        min={0}
        max={0.1}
        step={0.005}
        onChange={(v) => setConfig({ paperGrain: v })}
        displayValue={paperGrain.toFixed(3)}
      />
    </div>
  );
}
