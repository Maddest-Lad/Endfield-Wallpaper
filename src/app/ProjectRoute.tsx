import { use, useEffect } from 'react';
import { loadProject } from './registry';
import { AppShell } from './AppShell';

export function ProjectRoute({ id }: { id: string }) {
  const project = use(loadProject(id));

  // Free this project's layer canvases when leaving its route. The store is
  // module-level and deliberately survives, so settings persist across a trip
  // to the gallery.
  useEffect(() => () => project.disposeCaches(), [project]);

  return (
    <div
      data-project={id}
      className={`${project.meta.themeClass ?? ''} flex h-full w-full overflow-hidden bg-ef-light`}
    >
      <AppShell project={project} />
    </div>
  );
}
