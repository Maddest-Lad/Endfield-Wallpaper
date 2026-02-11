import { useState } from 'react';
import { WallpaperCanvas } from './components/WallpaperCanvas';
import { ControlPanel } from './components/ControlPanel';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="flex h-full w-full bg-ef-light">
      <WallpaperCanvas />
      <ControlPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

      {/* Mobile toggle button */}
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
