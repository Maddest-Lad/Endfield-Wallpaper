import { endfieldStore } from '@projects/endfield/store';
import { Select } from '@core/ui/Select';
import { Slider } from '@core/ui/Slider';
import { ColorPicker } from '@core/ui/ColorPicker';

const LOGO_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'industries', label: 'Endfield Industries' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'miku', label: 'Miku' },
];

export function LogoControls() {
  const logoVariant = endfieldStore.useConfig((c) => c.logoVariant) ?? 'none';
  const logoScale = endfieldStore.useConfig((c) => c.logoScale) ?? 0.3;
  const logoOpacity = endfieldStore.useConfig((c) => c.logoOpacity) ?? 0.15;
  const logoColor = endfieldStore.useConfig((c) => c.logoColor) ?? '';
  const setConfig = endfieldStore.actions.setConfig;

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
