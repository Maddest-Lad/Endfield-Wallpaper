import type { WallpaperConfig } from '../engine/types';

export interface Preset {
  name: string;
  config: Omit<WallpaperConfig, 'width' | 'height' | 'preset' | 'seed'>;
}

export const PRESETS: Preset[] = [
  {
    // Matches floor_plating.jpeg / store.jpeg — the core Endfield industrial look.
    // Dark background, yellow accents, grey mono contours, all overlays enabled
    // for maximum technical density: zones, crosshairs, hatching, data panels.
    name: 'Field Report',
    config: {
      theme: 'dark',
      accentColor: '#FFE600',
      noiseScale: 0.006,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      contourLevels: 20,
      contourColorMode: 'mono',
      contourGlow: 0,
      contourColor: '#888888',
      showGrid: true,
      showAnnotations: true,
      showCjkText: true,
      showFrames: true,
      showAccents: true,
      showScanLines: true,
      showDataPanel: true,
      showReticles: true,
      showCornerData: true,
      showZones: true,
      showHeroText: false,
    },
  },
  {
    // Dense dramatic terrain. Grey-to-yellow elevation gradient with subtle glow.
    // Grid and scan lines removed to let the contour density breathe.
    // Hero text + annotations + zones provide context without overwhelming.
    name: 'Storm Warning',
    config: {
      theme: 'dark',
      accentColor: '#FFE600',
      noiseScale: 0.005,
      octaves: 6,
      persistence: 0.55,
      lacunarity: 2.1,
      contourLevels: 28,
      contourColorMode: 'elevation',
      contourGlow: 0.3,
      contourColor: '#888888',
      showGrid: false,
      showAnnotations: true,
      showCjkText: true,
      showFrames: true,
      showAccents: true,
      showScanLines: false,
      showDataPanel: true,
      showReticles: false,
      showCornerData: true,
      showZones: true,
      showHeroText: true,
    },
  },
  {
    // Matches umbrella/packing tape/folder merchandise — the clean print aesthetic.
    // Light background, grey accent, fading contours, minimal overlays.
    // The only light preset; represents the clean topographic print style.
    name: 'Minimal Survey',
    config: {
      theme: 'light',
      accentColor: '#8A8A8A',
      noiseScale: 0.008,
      octaves: 3,
      persistence: 0.4,
      lacunarity: 2.0,
      contourLevels: 12,
      contourColorMode: 'fade',
      contourGlow: 0,
      contourColor: '#888888',
      showGrid: true,
      showAnnotations: false,
      showCjkText: false,
      showFrames: true,
      showAccents: false,
      showScanLines: false,
      showDataPanel: false,
      showReticles: false,
      showCornerData: false,
      showZones: false,
      showHeroText: false,
    },
  },
  {
    // Military redacted look with red accents on dark. Red-tinted contour lines
    // with subtle glow for an alert/warning feel. Annotations, CJK text, scan lines,
    // and hero text enabled for a restricted-access document aesthetic.
    name: 'Classified',
    config: {
      theme: 'dark',
      accentColor: '#FF4444',
      noiseScale: 0.007,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      contourLevels: 18,
      contourColorMode: 'mono',
      contourGlow: 0.2,
      contourColor: '#FF4444',
      showGrid: false,
      showAnnotations: true,
      showCjkText: true,
      showFrames: true,
      showAccents: true,
      showScanLines: true,
      showDataPanel: true,
      showReticles: true,
      showCornerData: true,
      showZones: true,
      showHeroText: true,
    },
  },
  {
    // Matches full_map.jpeg — world map overview with dense territory zones
    // and elevation-colored contours. Accents and grid removed to keep focus
    // on the terrain data and zone boundaries rather than yellow UI chrome.
    name: 'Deep Terrain',
    config: {
      theme: 'dark',
      accentColor: '#FFE600',
      noiseScale: 0.004,
      octaves: 5,
      persistence: 0.6,
      lacunarity: 2.2,
      contourLevels: 30,
      contourColorMode: 'elevation',
      contourGlow: 0,
      contourColor: '#888888',
      showGrid: false,
      showAnnotations: true,
      showCjkText: true,
      showFrames: true,
      showAccents: false,
      showScanLines: false,
      showDataPanel: true,
      showReticles: false,
      showCornerData: true,
      showZones: true,
      showHeroText: false,
    },
  },
  {
    // Matches full_map_b.jpeg — sparse eerie scan with cyan accent.
    // Fade contours with cyan tint for degraded-signal feel. Scan lines
    // and reticles for tactical HUD, zones for territory awareness.
    name: 'Signal Lost',
    config: {
      theme: 'dark',
      accentColor: '#00AEEF',
      noiseScale: 0.009,
      octaves: 3,
      persistence: 0.45,
      lacunarity: 1.8,
      contourLevels: 16,
      contourColorMode: 'fade',
      contourGlow: 0.15,
      contourColor: '#00AEEF',
      showGrid: false,
      showAnnotations: false,
      showCjkText: false,
      showFrames: true,
      showAccents: false,
      showScanLines: true,
      showDataPanel: false,
      showReticles: true,
      showCornerData: false,
      showZones: true,
      showHeroText: false,
    },
  },
  {
    // Matches holographic_topography.jpeg — the most striking reference.
    // Intensely glowing amber contour lines on dark, full glow effect,
    // elevation coloring for depth. Minimal overlays let the contours dominate.
    name: 'Holographic',
    config: {
      theme: 'dark',
      accentColor: '#FFB800',
      noiseScale: 0.005,
      octaves: 5,
      persistence: 0.55,
      lacunarity: 2.0,
      contourLevels: 26,
      contourColorMode: 'elevation',
      contourGlow: 1,
      contourColor: '#FFB800',
      showGrid: false,
      showAnnotations: false,
      showCjkText: false,
      showFrames: true,
      showAccents: true,
      showScanLines: false,
      showDataPanel: false,
      showReticles: false,
      showCornerData: false,
      showZones: true,
      showHeroText: false,
    },
  },
];
