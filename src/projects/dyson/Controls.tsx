import { Divider, SectionHeader } from '@core/ui/Section';
import { Slider } from '@core/ui/Slider';
import { Toggle } from '@core/ui/Toggle';
import { Select } from '@core/ui/Select';
import { ColorPicker } from '@core/ui/ColorPicker';
import { dysonStore } from './store';
import { PRESETS } from './presets';

const CORE_SWATCHES = ['#9AD5FF', '#E8F6FF', '#FFD9A8', '#FF9C6B', '#C9FF8F', '#FFB3E6'];
const STRUCTURE_SWATCHES = ['#8A7CF0', '#5FA8C7', '#7FA0B8', '#C77B5F', '#9E6FD6', '#6FB89A'];
const ACCENT_SWATCHES = ['#FFC66B', '#6BE8FF', '#FF6B8A', '#B8FF6B', '#FFFFFF', '#FF8A3D'];

const RING_COUNTS = ['0', '1', '2', '3', '4', '5', '6'].map((v) => ({ value: v, label: v }));

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function Controls() {
  const c = dysonStore.useConfig();
  const { setConfig, applyPreset } = dysonStore.actions;

  return (
    <>
      <SectionHeader>Presets</SectionHeader>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.name)}
            className="text-[10px] uppercase tracking-wider px-2 py-1
              border border-site-line text-site-ink bg-transparent
              hover:border-site-mid hover:bg-site-ink/5 active:bg-site-ink/10
              cursor-pointer transition-all"
          >
            {p.name}
          </button>
        ))}
      </div>

      <Divider />

      <SectionHeader>Structure</SectionHeader>
      <div className="flex flex-col gap-3">
        <Slider
          label="Shell Radius"
          value={c.structureRadius}
          min={0.14}
          max={0.36}
          step={0.005}
          onChange={(v) => setConfig({ structureRadius: v })}
          displayValue={pct(c.structureRadius)}
        />
        <Slider
          label="Panel Size"
          value={c.hexSize}
          min={0.045}
          max={0.16}
          step={0.005}
          onChange={(v) => setConfig({ hexSize: v })}
          displayValue={c.hexSize.toFixed(3)}
        />
        <Slider
          label="Enclosure"
          value={c.panelDensity}
          min={0.25}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ panelDensity: v })}
          displayValue={pct(c.panelDensity)}
        />
        <Slider
          label="Panel Emission"
          value={c.panelEmission}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ panelEmission: v })}
          displayValue={pct(c.panelEmission)}
        />
        <Slider
          label="Bloom Clustering"
          value={c.emissionScale}
          min={0.12}
          max={1.2}
          step={0.01}
          onChange={(v) => setConfig({ emissionScale: v })}
          displayValue={c.emissionScale.toFixed(2)}
        />
        <Slider
          label="Radiator Fins"
          value={c.finCount}
          min={0}
          max={16}
          step={1}
          onChange={(v) => setConfig({ finCount: v })}
        />
      </div>

      <Divider />

      <SectionHeader>Star</SectionHeader>
      <div className="flex flex-col gap-3">
        <Slider
          label="Core Intensity"
          value={c.coreIntensity}
          min={0.05}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ coreIntensity: v })}
          displayValue={pct(c.coreIntensity)}
        />
        <Slider
          label="Energy Beams"
          value={c.beamCount}
          min={0}
          max={8}
          step={1}
          onChange={(v) => setConfig({ beamCount: v })}
        />
      </div>

      <Divider />

      <SectionHeader>Rings</SectionHeader>
      <div className="flex flex-col gap-3">
        <Select
          label="Truss Count"
          value={String(c.ringCount)}
          options={RING_COUNTS}
          onChange={(v) => setConfig({ ringCount: Number(v) })}
        />
        <Slider
          label="Truss Width"
          value={c.ringWidth}
          min={0.015}
          max={0.1}
          step={0.005}
          onChange={(v) => setConfig({ ringWidth: v })}
          displayValue={c.ringWidth.toFixed(3)}
        />
        <Slider
          label="Inclination"
          value={c.ringInclination}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ ringInclination: v })}
          displayValue={pct(c.ringInclination)}
        />
        <Slider
          label="Inclination Spread"
          value={c.ringSpread}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ ringSpread: v })}
          displayValue={pct(c.ringSpread)}
        />
        <Toggle
          label="Spurs"
          checked={c.showSpurs}
          onChange={(v) => setConfig({ showSpurs: v })}
        />
        <Slider
          label="Swarm Density"
          value={c.debrisDensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ debrisDensity: v })}
          displayValue={pct(c.debrisDensity)}
        />
      </div>

      <Divider />

      <SectionHeader>Sky</SectionHeader>
      <div className="flex flex-col gap-3">
        <Slider
          label="Star Density"
          value={c.starDensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ starDensity: v })}
          displayValue={pct(c.starDensity)}
        />
        <Slider
          label="Nebula"
          value={c.nebulaStrength}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ nebulaStrength: v })}
          displayValue={pct(c.nebulaStrength)}
        />
        <Slider
          label="Vignette"
          value={c.vignette}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setConfig({ vignette: v })}
          displayValue={pct(c.vignette)}
        />
      </div>

      <Divider />

      <SectionHeader>Overlays</SectionHeader>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Graticule"
          checked={c.showGraticule}
          onChange={(v) => setConfig({ showGraticule: v })}
        />
        <Toggle
          label="Corner Brackets"
          checked={c.showBrackets}
          onChange={(v) => setConfig({ showBrackets: v })}
        />
        <Toggle
          label="Survey Caption"
          checked={c.showDataBlock}
          onChange={(v) => setConfig({ showDataBlock: v })}
        />
      </div>

      <Divider />

      <SectionHeader>Palette</SectionHeader>
      <div className="flex flex-col gap-3">
        <ColorPicker
          label="Star"
          value={c.coreColor}
          swatches={CORE_SWATCHES}
          onChange={(v) => setConfig({ coreColor: v })}
        />
        <ColorPicker
          label="Structure"
          value={c.structureColor}
          swatches={STRUCTURE_SWATCHES}
          onChange={(v) => setConfig({ structureColor: v })}
        />
        <ColorPicker
          label="Accent"
          value={c.accentColor}
          swatches={ACCENT_SWATCHES}
          onChange={(v) => setConfig({ accentColor: v })}
        />
      </div>
    </>
  );
}
