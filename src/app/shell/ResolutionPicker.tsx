import { useMemo } from 'react';
import type { AnyProject } from '@core/project/defineProject';
import { Select } from '@core/ui/Select';
import type { ResolutionPreset } from '@core/output/resolutions';

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

export function ResolutionPicker({ project }: { project: AnyProject }) {
  const presetOptions = useMemo(() => buildPresetOptions(), []);
  const { preset, width, height } = project.useConfig();

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Resolution"
        value={preset}
        options={presetOptions}
        onChange={(v) => project.setResolutionPreset(v as ResolutionPreset)}
      />
      {preset === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={100}
            value={width}
            onChange={(e) => project.setDimensions({ width: parseInt(e.target.value) || width })}
            onBlur={() => { if (width < 100) project.setDimensions({ width: 100 }); }}
            className="w-20 bg-transparent border border-site-line text-xs text-site-ink px-2 py-1 font-mono focus:border-site-mid focus:outline-none"
          />
          <span className="text-[10px] text-site-mid">x</span>
          <input
            type="number"
            min={100}
            value={height}
            onChange={(e) => project.setDimensions({ height: parseInt(e.target.value) || height })}
            onBlur={() => { if (height < 100) project.setDimensions({ height: 100 }); }}
            className="w-20 bg-transparent border border-site-line text-xs text-site-ink px-2 py-1 font-mono focus:border-site-mid focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
