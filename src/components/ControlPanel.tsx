import { ResolutionPicker } from './controls/ResolutionPicker';
import { ThemeControls } from './controls/ThemeControls';
import { NoiseControls } from './controls/NoiseControls';
import { TextToggles } from './controls/TextToggles';
import { ActionButtons } from './controls/ActionButtons';

function SectionHeader({ children }: { children: string }) {
  return (
    <h3 className="text-[9px] text-ef-mid uppercase tracking-[0.3em] mb-2 mt-1">
      {'[ '}{children}{' ]'}
    </h3>
  );
}

function Divider() {
  return <div className="h-px bg-ef-border my-3" />;
}

export function ControlPanel() {
  return (
    <aside className="w-72 border-l border-ef-border bg-white flex flex-col h-full font-sans">
      {/* Yellow top accent */}
      <div className="h-1 bg-ef-yellow" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-ef-border">
        <h1 className="font-endfield text-sm uppercase tracking-[0.25em] text-ef-dark">
          ENDFIELD
        </h1>
        <p className="text-[8px] text-ef-mid uppercase tracking-[0.2em] mt-0.5">
          Terrain Generator // v1.0
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-1">
        <SectionHeader>Resolution</SectionHeader>
        <ResolutionPicker />

        <Divider />

        <SectionHeader>Theme</SectionHeader>
        <ThemeControls />

        <Divider />

        <SectionHeader>Terrain Parameters</SectionHeader>
        <NoiseControls />

        <Divider />

        <SectionHeader>Layers</SectionHeader>
        <TextToggles />

        <Divider />

        <ActionButtons />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-ef-border">
        <p className="text-[7px] text-ef-mid/50 uppercase tracking-widest text-center">
          GEN-2026 // ENDFIELD INDUSTRIES
        </p>
      </div>
    </aside>
  );
}
