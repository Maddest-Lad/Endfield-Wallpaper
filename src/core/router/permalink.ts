import type { BaseConfig } from '../project/types';

/** localStorage key for a project's last-used config. */
export function storageKey(projectId: string): string {
  return `fieldgrid:${projectId}:config`;
}

export function encodeConfig<C extends BaseConfig>(config: C): string {
  try {
    return btoa(JSON.stringify(config));
  } catch {
    return '';
  }
}

/**
 * Decode a base64 config payload, merged over `defaults` so configs saved before
 * a field existed still load. Returns null if the payload is absent or unusable.
 */
export function decodeConfig<C extends BaseConfig>(
  payload: string | null | undefined,
  defaults: C,
): C | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(atob(payload));
    // Structural BaseConfig check — enough to reject anything that isn't ours.
    if (typeof parsed.width === 'number' && typeof parsed.seed === 'string') {
      return { ...defaults, ...parsed } as C;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadSavedConfig<C extends BaseConfig>(projectId: string, defaults: C): C | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.width === 'number' && typeof parsed.seed === 'string') {
      return { ...defaults, ...parsed } as C;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveConfig<C extends BaseConfig>(projectId: string, config: C): void {
  try {
    localStorage.setItem(storageKey(projectId), JSON.stringify(config));
  } catch {
    /* quota exceeded or private browsing — ignore */
  }
}
