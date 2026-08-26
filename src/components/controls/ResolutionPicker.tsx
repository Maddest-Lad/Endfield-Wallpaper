import { useMemo } from 'react';
import { endfieldStore } from '@projects/endfield/store';
import { Select } from '../ui/Select';
import type { ResolutionPreset } from '@projects/endfield/types';

// Built lazily — reading screen/devicePixelRatio at module scope would run on
// import, before this project's route is even mounted.
function buildPresetOptions() {
  const dpr = window.devicePixelRatio || 1;
  const devW = Math.round(screen.width * dpr);
  const devH = Math.round(screen.height * dpr);
  return [
  { value: 'device', label: `${devW} x ${devH} — YOUR DEVICE` },
  { value: '1080p', label: '1920 x 1080 — FHD' },
  { value: '1440p', label: '2560 x 1440 — QHD' },
  { value: '4k', label: '3840 x 2160 — 4K' },
  { value: 'ultrawide', label: '3440 x 1440 — ULTRAWIDE' },
  { value: 'discord', label: '960 x 540 — DISCORD' },
  { value: 'twitter', label: '1500 x 500 — TWITTER / X' },
  { value: 'linkedin', label: '1584 x 396 — LINKEDIN' },
  { value: 'youtube', label: '2560 x 1440 — YOUTUBE' },
  { value: 'facebook', label: '1640 x 624 — FACEBOOK' },
  { value: 'twitch', label: '1200 x 480 — TWITCH' },
  { value: 'custom', label: 'CUSTOM' },
  ];
}

export function ResolutionPicker() {
  const presetOptions = useMemo(() => buildPresetOptions(), []);
  const { preset, width, height } = endfieldStore.useConfig();
  const { setResolutionPreset, setConfig } = endfieldStore.actions;

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Resolution"
        value={preset}
        options={presetOptions}
        onChange={(v) => setResolutionPreset(v as ResolutionPreset)}
      />
      {preset === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={100}
            value={width}
            onChange={(e) => setConfig({ width: parseInt(e.target.value) || width })}
            onBlur={() => { if (width < 100) setConfig({ width: 100 }); }}
            className="w-20 bg-transparent border border-ef-border text-xs text-ef-dark px-2 py-1 font-mono focus:border-ef-yellow focus:outline-none"
          />
          <span className="text-[10px] text-ef-mid">x</span>
          <input
            type="number"
            min={100}
            value={height}
            onChange={(e) => setConfig({ height: parseInt(e.target.value) || height })}
            onBlur={() => { if (height < 100) setConfig({ height: 100 }); }}
            className="w-20 bg-transparent border border-ef-border text-xs text-ef-dark px-2 py-1 font-mono focus:border-ef-yellow focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
