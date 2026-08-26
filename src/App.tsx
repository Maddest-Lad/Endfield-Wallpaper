import { useState } from 'react';
import endfield from '@projects/endfield';
import { CanvasStage } from './app/shell/CanvasStage';
import { PanelShell } from './app/shell/PanelShell';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false);
  const project = endfield;

  return (
    <div className={`${project.meta.themeClass ?? ''} flex h-full w-full overflow-hidden bg-ef-light`}>
      <CanvasStage project={project} />
      <PanelShell project={project} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

      {/* Mobile toggle */}
      <button
        onClick={() => setPanelOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-20 w-11 h-11 bg-ef-yellow flex items-center justify-center shadow-lg cursor-pointer active:brightness-90"
        aria-label="Open controls"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="square">
          <path d="M2 4h14M2 9h14M2 14h14" />
        </svg>
      </button>
    </div>
  );
}
