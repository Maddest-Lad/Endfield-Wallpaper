import { SectionHeader, Divider } from '@core/ui/Section';
import { Slider } from '@core/ui/Slider';
import { Toggle } from '@core/ui/Toggle';
import { Select } from '@core/ui/Select';
import { ColorPicker } from '@core/ui/ColorPicker';
import { starchartStore } from './store';
import { PRESETS } from './presets';
import { THEME_OPTIONS, type ThemeName } from './palette';
import { PROJECTION_OPTIONS, formatRa, formatDec, type ProjectionName } from './sky';
import { SKY_REGIONS } from './regions';
import { StarSearch } from './StarSearch';
import { SkyGlobe } from './SkyGlobe';

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
      <SectionHeader>Pointing</SectionHeader>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {SKY_REGIONS.map((r) => (
            <button
              key={r.name}
              onClick={() =>
                setConfig({ raCenter: r.ra, decCenter: r.dec, fieldOfView: r.fov })
              }
              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5
                border border-site-line text-site-dim bg-transparent
                hover:border-[var(--project-accent)] hover:text-site-ink
                cursor-pointer transition-all"
            >
              {r.name}
            </button>
          ))}
        </div>
        <StarSearch />
        <SkyGlobe />
        <Slider
          label="Right Ascension"
          value={c.raCenter}
          min={0}
          max={360}
          step={0.5}
          onChange={(v) => setConfig({ raCenter: v })}
          displayValue={formatRa(c.raCenter)}
        />
        <Slider
          label="Declination"
          value={c.decCenter}
          min={-89}
          max={89}
          step={0.5}
          onChange={(v) => setConfig({ decCenter: v })}
          displayValue={formatDec(c.decCenter)}
        />
        <Slider
          label="Field of View"
          value={c.fieldOfView}
          min={6}
          max={130}
          step={1}
          onChange={(v) => setConfig({ fieldOfView: v })}
          displayValue={`${c.fieldOfView}°`}
        />
        <Slider
          label="Roll"
          value={c.roll}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => setConfig({ roll: v })}
          displayValue={`${c.roll}°`}
        />
        <Select
          label="Projection"
          value={c.projection}
          options={PROJECTION_OPTIONS}
          onChange={(v) => setConfig({ projection: v as ProjectionName })}
        />
        <Slider
          label="Limiting Mag"
          value={c.limitingMag}
          min={2}
          max={8}
          step={0.1}
          onChange={(v) => setConfig({ limitingMag: v })}
          displayValue={c.limitingMag.toFixed(1)}
        />
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
          label="Milky Way"
          value={c.hazeStrength}
          min={0}
          max={1}
          step={0.02}
          onChange={(v) => setConfig({ hazeStrength: v })}
          displayValue={pct(c.hazeStrength)}
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
          label="Galactic Grid"
          checked={c.galacticGrid}
          onChange={(v) => setConfig({ galacticGrid: v })}
        />
        <Toggle
          label="Constellations"
          checked={c.showConstellations}
          onChange={(v) => setConfig({ showConstellations: v })}
        />
        <Toggle
          label="Figure Names"
          checked={c.constellationLabels}
          onChange={(v) => setConfig({ constellationLabels: v })}
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
