import { SectionHeader, Divider } from '@core/ui/Section';
import { Slider } from '@core/ui/Slider';
import { Toggle } from '@core/ui/Toggle';
import { Select } from '@core/ui/Select';
import { ColorPicker } from '@core/ui/ColorPicker';
import { starchartStore } from './store';
import { PRESETS } from './presets';
import { THEME_OPTIONS, type ThemeName } from './palette';

const ACCENT_SWATCHES = [
  '#6FD3FF',
  '#7FE3C0',
  '#FF8A3D',
  '#FF5F7E',
  '#C9A227',
  '#A03A2A',
  '#B98CFF',
  '#E8ECF2',
];

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function Controls() {
  const c = starchartStore.useConfig();
  const { setConfig, applyPreset } = starchartStore.actions;

  return (
    <>
      <SectionHeader>Plates</SectionHeader>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.name)}
            className="text-[10px] uppercase tracking-wider px-2 py-1
              border border-site-line text-site-ink bg-transparent
              hover:border-[var(--project-accent)] cursor-pointer transition-all"
          >
            {p.name}
          </button>
        ))}
      </div>

      <Divider />
      <SectionHeader>Field</SectionHeader>
      <div className="flex flex-col gap-3">
        <Select
          label="Plate Stock"
          value={c.theme}
          options={THEME_OPTIONS}
          onChange={(v) => setConfig({ theme: v as ThemeName })}
        />
        <ColorPicker
          label="Accent"
          value={c.accentColor}
          swatches={ACCENT_SWATCHES}
          onChange={(v) => setConfig({ accentColor: v })}
        />
        <Slider
          label="Star Density"
          value={c.starDensity}
          min={0.2}
          max={2.5}
          step={0.05}
          onChange={(v) => setConfig({ starDensity: v })}
          displayValue={`${c.starDensity.toFixed(2)}x`}
        />
        <Slider
          label="Bloom"
          value={c.starBloom}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ starBloom: v })}
          displayValue={pct(c.starBloom)}
        />
        <Slider
          label="Spectral Tint"
          value={c.spectralTint}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ spectralTint: v })}
          displayValue={pct(c.spectralTint)}
        />
        <Slider
          label="Haze"
          value={c.hazeStrength}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ hazeStrength: v })}
          displayValue={pct(c.hazeStrength)}
        />
        <Slider
          label="Plane Curve"
          value={c.hazeCurve}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => setConfig({ hazeCurve: v })}
          displayValue={c.hazeCurve.toFixed(2)}
        />
        <Slider
          label="Grain"
          value={c.grain}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ grain: v })}
          displayValue={pct(c.grain)}
        />
      </div>

      <Divider />
      <SectionHeader>Structure</SectionHeader>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Graticule"
          checked={c.showGraticule}
          onChange={(v) => setConfig({ showGraticule: v })}
        />
        <Slider
          label="Grid Weight"
          value={c.graticuleOpacity}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ graticuleOpacity: v })}
          displayValue={pct(c.graticuleOpacity)}
        />
        <Toggle
          label="2nd Projection"
          checked={c.secondaryProjection}
          onChange={(v) => setConfig({ secondaryProjection: v })}
        />
        <Toggle
          label="Constellations"
          checked={c.showConstellations}
          onChange={(v) => setConfig({ showConstellations: v })}
        />
        <Slider
          label="Figures"
          value={c.constellationCount}
          min={0}
          max={36}
          step={1}
          onChange={(v) => setConfig({ constellationCount: v })}
        />
      </div>

      <Divider />
      <SectionHeader>Network</SectionHeader>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Trade Lanes"
          checked={c.showRoutes}
          onChange={(v) => setConfig({ showRoutes: v })}
        />
        <Slider
          label="Lane Density"
          value={c.routeDensity}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ routeDensity: v })}
          displayValue={pct(c.routeDensity)}
        />
      </div>

      <Divider />
      <SectionHeader>Annotation</SectionHeader>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Designators"
          checked={c.showLabels}
          onChange={(v) => setConfig({ showLabels: v })}
        />
        <Slider
          label="Label Density"
          value={c.labelDensity}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ labelDensity: v })}
          displayValue={pct(c.labelDensity)}
        />
        <Toggle
          label="Callouts"
          checked={c.showCallouts}
          onChange={(v) => setConfig({ showCallouts: v })}
        />
        <Toggle
          label="Detail Insets"
          checked={c.showInsets}
          onChange={(v) => setConfig({ showInsets: v })}
        />
      </div>

      <Divider />
      <SectionHeader>Plate</SectionHeader>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Frame"
          checked={c.showFrame}
          onChange={(v) => setConfig({ showFrame: v })}
        />
        <Toggle
          label="Title Block"
          checked={c.showTitleBlock}
          onChange={(v) => setConfig({ showTitleBlock: v })}
        />
        <Slider
          label="Margin"
          value={c.margin}
          min={0.015}
          max={0.09}
          step={0.005}
          onChange={(v) => setConfig({ margin: v })}
          displayValue={pct(c.margin)}
        />
      </div>
    </>
  );
}
