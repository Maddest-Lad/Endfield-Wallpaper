export type ResolutionPreset =
  | '1080p'
  | '1440p'
  | '4k'
  | 'ultrawide'
  | 'discord'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'facebook'
  | 'twitch'
  | 'device'
  | 'custom';

/** Fixed dimensions per preset. `null` means the caller supplies them. */
export const RESOLUTION_PRESETS: Record<ResolutionPreset, { width: number; height: number } | null> = {
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
  ultrawide: { width: 3440, height: 1440 },
  discord: { width: 960, height: 540 },
  twitter: { width: 1500, height: 500 },
  linkedin: { width: 1584, height: 396 },
  youtube: { width: 2560, height: 1440 },
  facebook: { width: 1640, height: 624 },
  twitch: { width: 1200, height: 480 },
  device: null,
  custom: null,
};

/**
 * Resolve a preset to concrete dimensions. Reads `screen`/`devicePixelRatio` for
 * 'device', so this must be called lazily — never at module scope.
 */
export function resolveResolution(
  preset: ResolutionPreset,
): { preset: ResolutionPreset; width?: number; height?: number } {
  if (preset === 'device') {
    const dpr = window.devicePixelRatio || 1;
    return {
      preset,
      width: Math.round(screen.width * dpr),
      height: Math.round(screen.height * dpr),
    };
  }
  const res = RESOLUTION_PRESETS[preset];
  return res ? { preset, width: res.width, height: res.height } : { preset };
}
