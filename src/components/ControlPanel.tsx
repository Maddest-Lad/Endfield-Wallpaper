import { ResolutionPicker } from './controls/ResolutionPicker';
import { PresetPicker } from './controls/PresetPicker';
import { ThemeControls } from './controls/ThemeControls';
import { NoiseControls } from './controls/NoiseControls';
import { ContourControls } from './controls/ContourControls';
import { TextToggles } from './controls/TextToggles';
import { LogoControls } from './controls/LogoControls';
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

function PanelContent({ onClose }: { onClose?: () => void }) {
  const randomize = useWallpaperConfig((s) => s.randomize);

  return (
    <>
      {/* Header */}
      <div className="bg-ef-dark px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-endfield text-base uppercase tracking-[0.25em] text-ef-light">
            ENDFIELD
          </h1>
          <p className="text-[9px] text-ef-light/50 uppercase tracking-[0.2em] mt-0.5">
            Terrain Generator // v1.0
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-ef-light/60 hover:text-ef-light transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        )}
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

        <SectionHeader>Icon</SectionHeader>
        <LogoControls />

        <Divider />

        <SectionHeader>Output</SectionHeader>
        <ResolutionPicker />
        <div className="mt-2">
          <ActionButtons />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-ef-dark px-4 py-2 space-y-1.5">
        <p className="text-[7px] text-ef-light/25 text-center leading-relaxed">
          Unofficial fan project derived from Arknights: Endfield.
          Not affiliated with or endorsed by Yostar, HyperGryphon, or miHoYo.
          Non-commercial use only.
        </p>
        <p className="text-[7px] text-ef-light/25 text-center leading-relaxed">
          Endfield font by{' '}
          <a
            href="https://github.com/lhclbt/Endfield_Font"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ef-light/40"
          >
            Luo Butan
          </a>{' '}
          (CC BY-NC 4.0).{' '}
          Logo icons by{' '}
          <a
            href="https://github.com/Yue-plus/endfield_icons"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ef-light/40"
          >
            Yue-plus
          </a>{' '}
          (MIT)
        </p>
      </div>
    </>
  );
}

export function ControlPanel({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:flex w-72 border-l border-ef-border bg-white flex-col h-full font-sans">
        <PanelContent />
      </aside>

      {/* Mobile: slide-out drawer */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30"
            onClick={onClose}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 right-0 h-full w-72 bg-white flex flex-col font-sans z-40 transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <PanelContent onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
