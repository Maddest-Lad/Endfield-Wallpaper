import type { AnyProject } from '@core/project/defineProject';
import { Button } from '@core/ui/Button';
import { Divider } from '@core/ui/Section';
import { OutputSection } from './OutputSection';

interface PanelShellProps {
  project: AnyProject;
  isOpen?: boolean;
  onClose?: () => void;
  onBack?: () => void;
}

/**
 * The control panel. One <aside> serving both layouts: fixed drawer below the lg
 * breakpoint, static sidebar above it. Rendering it twice (one hidden) would
 * duplicate every input and every store subscription.
 */
export function PanelShell({ project, isOpen, onClose, onBack }: PanelShellProps) {
  const { meta } = project;

  return (
    <>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={onClose} />}

      <aside
        className={`w-72 h-full bg-white flex flex-col font-sans fixed top-0 right-0 z-40
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:border-l lg:border-site-line lg:translate-x-0 lg:transition-none
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="bg-site-ink px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <button
              onClick={onBack}
              className="project-title text-base uppercase tracking-[0.25em] text-white hover:opacity-70 transition-colors cursor-pointer text-left truncate block"
            >
              {meta.title}
            </button>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] mt-0.5 truncate">
              {meta.tagline} // {meta.version}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close panel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          )}
        </div>
        <div className="h-1 bg-[var(--project-accent)]" />

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-1">
          <Button onClick={project.randomize} className="w-full">RANDOMIZE</Button>

          <Divider />

          <project.Controls />

          <Divider />

          <OutputSection project={project} />

          {meta.attribution && (
            <div className="bg-site-ink px-4 py-2 mt-4 -mx-4 -mb-3">
              <p className="text-[12pt] text-white/25 text-center leading-relaxed">
                {meta.attribution}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
