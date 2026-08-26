import { SectionHeader } from '@core/ui/Section';
import { Slider } from '@core/ui/Slider';
import { Toggle } from '@core/ui/Toggle';
import { ColorPicker } from '@core/ui/ColorPicker';
import { blankStore } from './store';

export function Controls() {
  const { background, ink, showGuides, margin } = blankStore.useConfig();
  const { setConfig } = blankStore.actions;

  return (
    <>
      <SectionHeader>Canvas</SectionHeader>
      <div className="flex flex-col gap-3">
        <ColorPicker
          label="Background"
          value={background}
          onChange={(v) => setConfig({ background: v })}
        />
        <ColorPicker label="Ink" value={ink} onChange={(v) => setConfig({ ink: v })} />
        <Toggle
          label="Guides"
          checked={showGuides}
          onChange={(v) => setConfig({ showGuides: v })}
        />
        <Slider
          label="Margin"
          value={margin}
          min={0}
          max={0.12}
          step={0.005}
          onChange={(v) => setConfig({ margin: v })}
          displayValue={`${Math.round(margin * 100)}%`}
        />
      </div>
    </>
  );
}
