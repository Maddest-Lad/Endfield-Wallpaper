import { useState } from 'react';
import type { AnyProject } from '@core/project/defineProject';
import { navigate } from '@core/router/hashRoute';
import { CanvasStage } from './shell/CanvasStage';
import { PanelShell } from './shell/PanelShell';

export function AppShell({ project }: { project: AnyProject }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <CanvasStage project={project} />
      <PanelShell
        project={project}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onBack={() => navigate(null)}
      />

      {/* Mobile: open the control drawer */}
      <button
        onClick={() => setPanelOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-20 w-11 h-11 flex items-center justify-center shadow-lg cursor-pointer active:brightness-90"
        // `var(--project-accent)`, not `project.meta.cardAccent`: the CSS var
        // is live (ProjectRoute keeps it in sync with the config), the static
        // meta field is whatever the project shipped with and never updates
        // when the user picks a different accent in the panel.
        style={{ backgroundColor: 'var(--project-accent)' }}
        aria-label="Open controls"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="square">
          <path d="M2 4h14M2 9h14M2 14h14" />
        </svg>
      </button>
    </>
  );
}
