import { SectionHeader, Divider } from '@core/ui/Section';
import { Slider } from '@core/ui/Slider';
import { endfieldStore } from './store';
import { PresetPicker } from './controls/PresetPicker';
import { ThemeControls } from './controls/ThemeControls';
import { NoiseControls } from './controls/NoiseControls';
import { ContourControls } from './controls/ContourControls';
import { TextToggles } from './controls/TextToggles';
import { LogoControls } from './controls/LogoControls';

export function Controls() {
  const { edgePadding } = endfieldStore.useConfig();
  const { setConfig } = endfieldStore.actions;

  return (
    <>
      <SectionHeader>Presets</SectionHeader>
      <PresetPicker />

      <Divider />

      <SectionHeader>Theme</SectionHeader>
      <ThemeControls />

      <Divider />

      <SectionHeader>Terrain Parameters</SectionHeader>
      <NoiseControls />

      <Divider />

      <SectionHeader>Contour Style</SectionHeader>
      <ContourControls />

      <Divider />

      <SectionHeader>Layers</SectionHeader>
      <div className="mb-3">
        <Slider
          label="Edge Padding"
          value={edgePadding}
          min={0}
          max={0.15}
          step={0.005}
          onChange={(v) => setConfig({ edgePadding: v })}
          displayValue={`${Math.round(edgePadding * 100)}%`}
        />
      </div>
      <TextToggles />

      <Divider />

      <SectionHeader>Icon</SectionHeader>
      <LogoControls />
    </>
  );
}
