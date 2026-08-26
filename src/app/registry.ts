import type { AnyProject, ProjectMeta } from '@core/project/defineProject';
import { endfieldMeta } from '@projects/endfield/meta';

export interface RegistryEntry {
  /** Eager: the gallery needs this without loading the project's code. */
  meta: ProjectMeta;
  /** Lazy: everything heavy lives behind this dynamic import. */
  load: () => Promise<AnyProject>;
}

export const PROJECTS: RegistryEntry[] = [
  { meta: endfieldMeta, load: () => import('@projects/endfield').then((m) => m.default) },
];

const inflight = new Map<string, Promise<AnyProject>>();

/**
 * Returns a STABLE promise per id. This is load-bearing, not an optimisation:
 * React's `use()` re-invokes on every render, and a fresh promise each time would
 * suspend forever under StrictMode.
 */
export function loadProject(id: string): Promise<AnyProject> {
  let pending = inflight.get(id);
  if (!pending) {
    const entry = PROJECTS.find((e) => e.meta.id === id);
    if (!entry) return Promise.reject(new Error(`Unknown project: ${id}`));
    pending = entry.load();
    inflight.set(id, pending);
  }
  return pending;
}

export function hasProject(id: string): boolean {
  return PROJECTS.some((e) => e.meta.id === id);
}
