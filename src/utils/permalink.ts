import type { WallpaperConfig } from '../engine/types';

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
      return parsed as WallpaperConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function updateUrlHash(config: WallpaperConfig): void {
  const encoded = encodeConfig(config);
  if (encoded) {
    window.history.replaceState(null, '', `#${encoded}`);
  }
}
