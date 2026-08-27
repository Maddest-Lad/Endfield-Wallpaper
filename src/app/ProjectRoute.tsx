import { use, useEffect, useMemo } from 'react';
import type React from 'react';
import { loadProject } from './registry';
import { AppShell } from './AppShell';

export function ProjectRoute({ id }: { id: string }) {
  const project = use(loadProject(id));

  // Free this project's layer canvases when leaving its route. The store is
  // module-level and deliberately survives, so settings persist across a trip
  // to the gallery.
  useEffect(() => () => project.disposeCaches(), [project]);

  // Subscribes to the WHOLE config, not a selector that builds an object (e.g.
  // `useConfig(c => project.getThemeVars())`). Zustand v5's plain `useStore`
  // compares the selector's return by reference on every render; a selector
  // that constructs a fresh object each call never compares equal to its own
  // last result, and React's `useSyncExternalStore` treats that as "the store
  // keeps changing," which is an infinite-render loop, not just wasted work.
  // `config` itself only changes reference when the store actually updates, so
  // deriving the vars in a `useMemo` keyed on it is safe.
  const config = project.useConfig();
  const themeVars = useMemo(() => project.getThemeVars(config), [project, config]);

  // `meta.cardAccent` is the fallback for a project with no `themeVars` (or
  // one that doesn't happen to set `--project-accent`), and it's what paints
  // the very first frame before the store's initial config is known.
  const vars = {
    '--project-accent': project.meta.cardAccent,
    ...themeVars,
  } as React.CSSProperties;

  return (
    <div
      data-project={id}
      style={vars}
      className={`${project.meta.themeClass ?? ''} flex h-full w-full overflow-hidden bg-site-paper`}
    >
      <AppShell project={project} />
    </div>
  );
}
