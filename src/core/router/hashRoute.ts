import { useSyncExternalStore } from 'react';

/**
 * Hash routing, chosen so GitHub Pages needs no 404.html fallback and deep links
 * survive a refresh with no server cooperation.
 *
 *   #  or  #/           gallery
 *   #/endfield          project, default or saved config
 *   #/endfield?c=<b64>  project, config from a permalink
 *   #<b64>              legacy v1 permalink (no leading '/') -> endfield
 */
export const LEGACY_PROJECT_ID = 'endfield';

export interface Route {
  projectId: string | null;
  configParam: string | null;
}

export function parseHash(hash: string): Route {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return { projectId: null, configParam: null };

  if (raw.startsWith('/')) {
    const q = raw.indexOf('?c=');
    const path = (q === -1 ? raw : raw.slice(0, q)).replace(/^\/+|\/+$/g, '');
    return { projectId: path || null, configParam: q === -1 ? null : raw.slice(q + 3) };
  }

  // No leading slash: a pre-router permalink, which was the bare base64 payload.
  return { projectId: LEGACY_PROJECT_ID, configParam: raw };
}

export function formatHash(projectId: string | null, configParam?: string | null): string {
  if (!projectId) return '#/';
  return configParam ? `#/${projectId}?c=${configParam}` : `#/${projectId}`;
}

/** Navigate, creating a history entry so the back button works. */
export function navigate(projectId: string | null): void {
  window.location.hash = formatHash(projectId);
}

/**
 * Write the config payload without creating a history entry and without
 * disturbing the route. Rebuilds the whole hash from formatHash rather than
 * reading location.hash, so the route segment is preserved by construction.
 */
export function replaceConfigParam(projectId: string, configParam: string): void {
  window.history.replaceState(null, '', formatHash(projectId, configParam));
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

/** useSyncExternalStore rather than useState+listener: StrictMode-safe, correct initial snapshot. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );
  return parseHash(hash);
}
