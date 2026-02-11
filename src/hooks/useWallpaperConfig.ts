import { create } from 'zustand';
import type { WallpaperConfig, ResolutionPreset, ContourColorMode } from '../engine/types';
import { randomSeed } from '../utils/random';
import { PRESETS } from '../data/presets';
import { DEFAULTS } from '../data/defaults';
import { ACCENT_COLORS } from '../data/colors';
import { decodeConfig, loadSavedConfig } from '../utils/permalink';
const CONTOUR_MODES: ContourColorMode[] = ['mono', 'elevation', 'fade'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RESOLUTION_PRESETS: Record<ResolutionPreset, { width: number; height: number } | null> = {
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
  ultrawide: { width: 3440, height: 1440 },
  custom: null,
};

function getInitialConfig(): WallpaperConfig {
  // URL hash takes priority (shared permalink), then localStorage, then defaults
  return decodeConfig(window.location.hash) ?? loadSavedConfig() ?? DEFAULTS;
}

interface WallpaperStore extends WallpaperConfig {
  setConfig: (partial: Partial<WallpaperConfig>) => void;
  setPreset: (preset: ResolutionPreset) => void;
  randomize: () => void;
  applyPreset: (name: string) => void;
}

const initialConfig = getInitialConfig();

export const useWallpaperConfig = create<WallpaperStore>((set) => ({
  ...initialConfig,

  setConfig: (partial) => set(partial),

  setPreset: (preset) =>
    set(() => {
      const res = RESOLUTION_PRESETS[preset];
      if (res) {
        return { preset, width: res.width, height: res.height };
      }
      return { preset };
    }),

  randomize: () =>
    set(() => {
      const color = pick(ACCENT_COLORS);
      return {
        seed: randomSeed(),
        noiseScale: 0.003 + Math.random() * 0.01,
        octaves: 3 + Math.floor(Math.random() * 3),
        persistence: 0.35 + Math.random() * 0.3,
        contourLevels: 14 + Math.floor(Math.random() * 16),
        theme: Math.random() > 0.5 ? 'dark' as const : 'light' as const,
        accentColor: color,
        contourColor: color,
        contourColorMode: pick(CONTOUR_MODES),
        contourGlow: Math.random() > 0.6 ? Math.round(Math.random() * 100) / 100 : 0,
        showGrid: Math.random() > 0.3,
        showAnnotations: Math.random() > 0.3,
        showCjkText: Math.random() > 0.4,
        showFrames: Math.random() > 0.2,
        showAccents: Math.random() > 0.3,
        showScanLines: Math.random() > 0.5,
        showDataPanel: Math.random() > 0.4,
        showReticles: Math.random() > 0.4,
        showCornerData: Math.random() > 0.4,
        showZones: Math.random() > 0.4,
        showHeroText: Math.random() > 0.7,
      };
    }),

  applyPreset: (name) =>
    set(() => {
      const preset = PRESETS.find((p) => p.name === name);
      if (!preset) return {};
      return { ...preset.config, seed: randomSeed() };
    }),
}));
