import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { ColorPicker } from '../ui/ColorPicker';

const LOGO_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'industries', label: 'Endfield Industries' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

export function LogoControls() {
  const logoVariant = useWallpaperConfig((s) => s.logoVariant) ?? 'none';
  const logoScale = useWallpaperConfig((s) => s.logoScale) ?? 0.3;
  const logoOpacity = useWallpaperConfig((s) => s.logoOpacity) ?? 0.15;
  const logoColor = useWallpaperConfig((s) => s.logoColor) ?? '';
  const setConfig = useWallpaperConfig((s) => s.setConfig);

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Logo"
        value={logoVariant}
        options={LOGO_OPTIONS}
        onChange={(v) => setConfig({ logoVariant: v })}
      />
      {logoVariant !== 'none' && (
        <>
          <Slider
            label="Scale"
            value={logoScale}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => setConfig({ logoScale: v })}
            displayValue={`${Math.round(logoScale * 100)}%`}
          />
          <Slider
            label="Opacity"
            value={logoOpacity}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => setConfig({ logoOpacity: v })}
            displayValue={`${Math.round(logoOpacity * 100)}%`}
          />
          <ColorPicker
            label="Color"
            value={logoColor || '#FFFFFF'}
            onChange={(c) => setConfig({ logoColor: c })}
          />
        </>
      )}
    </div>
  );
}
