import { ResolutionPicker } from './controls/ResolutionPicker';
import { PresetPicker } from './controls/PresetPicker';
import { ThemeControls } from './controls/ThemeControls';
import { NoiseControls } from './controls/NoiseControls';
import { ContourControls } from './controls/ContourControls';
import { TextToggles } from './controls/TextToggles';
import { ActionButtons } from './controls/ActionButtons';
import { Button } from './ui/Button';
import { useWallpaperConfig } from '../hooks/useWallpaperConfig';

function SectionHeader({ children }: { children: string }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.3em] mb-2 mt-1">
      <span className="text-ef-yellow font-bold mr-1">{'\u203A\u203A'}</span>
      <span className="text-ef-mid">{children}</span>
    </h3>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-1.5 my-3">
      <div className="w-1.5 h-1.5 bg-ef-yellow rotate-45" />
      <div className="flex-1 h-px bg-ef-border" />
    </div>
  );
}

export function ControlPanel() {
  const randomize = useWallpaperConfig((s) => s.randomize);

  return (
    <aside className="w-72 border-l border-ef-border bg-white flex flex-col h-full font-sans">
      {/* Header — dark background matching data panel header style */}
      <div className="bg-ef-dark px-4 py-3">
        <h1 className="font-endfield text-base uppercase tracking-[0.25em] text-ef-light">
          ENDFIELD
        </h1>
        <p className="text-[9px] text-ef-light/50 uppercase tracking-[0.2em] mt-0.5">
          Terrain Generator // v1.0
        </p>
      </div>
      <div className="h-1 bg-ef-yellow" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-1">
        <SectionHeader>Presets</SectionHeader>
        <PresetPicker />
        <div className="mt-2">
          <Button onClick={randomize} className="w-full">RANDOMIZE</Button>
        </div>

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
        <TextToggles />

        <Divider />

        <SectionHeader>Output</SectionHeader>
        <ResolutionPicker />
        <div className="mt-2">
          <ActionButtons />
        </div>
      </div>

      {/* Footer — dark to match header */}
      <div className="bg-ef-dark px-4 py-2">
        <p className="text-[8px] text-ef-light/30 uppercase tracking-widest text-center">
          GEN-2026 // ENDFIELD INDUSTRIES
        </p>
      </div>
    </aside>
  );
}
