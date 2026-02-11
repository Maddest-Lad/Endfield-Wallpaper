import type { WallpaperConfig } from '../engine/types';
import { DEFAULTS } from '../data/defaults';

export function encodeConfig(config: WallpaperConfig): string {
  try {
    return btoa(JSON.stringify(config));
  } catch {
    return '';
  }
}

export function decodeConfig(hash: string): WallpaperConfig | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!raw) return null;
    const parsed = JSON.parse(atob(raw));
    // Basic validation: must have width and seed
    if (typeof parsed.width === 'number' && typeof parsed.seed === 'string') {
      return { ...DEFAULTS, ...parsed } as WallpaperConfig;
    }
    return null;
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'endfield-terrain-config';

export function updateUrlHash(config: WallpaperConfig): void {
  const encoded = encodeConfig(config);
  if (encoded) {
    window.history.replaceState(null, '', `#${encoded}`);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch { /* quota exceeded or private browsing — ignore */ }
  }
}

export function loadSavedConfig(): WallpaperConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.width === 'number' && typeof parsed.seed === 'string') {
      return { ...DEFAULTS, ...parsed } as WallpaperConfig;
    }
    return null;
  } catch {
    return null;
  }
}
