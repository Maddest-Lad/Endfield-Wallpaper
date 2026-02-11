import type { ThemeMode, ThemePalette } from '../engine/types';

export function getPalette(theme: ThemeMode, accentColor: string): ThemePalette {
  if (theme === 'dark') {
    return {
      background: '#1A1A1A',
      contourLine: 'rgba(200, 200, 200, 0.25)',
      contourIndex: 'rgba(220, 220, 220, 0.45)',
      gridMajor: 'rgba(255, 255, 255, 0.06)',
      gridMinor: 'rgba(255, 255, 255, 0.03)',
      gridLabel: 'rgba(255, 255, 255, 0.12)',
      textPrimary: 'rgba(255, 255, 255, 0.7)',
      textSecondary: 'rgba(255, 255, 255, 0.25)',
      accent: accentColor,
      frameLine: 'rgba(255, 255, 255, 0.2)',
    };
  }

  return {
    background: '#F5F5F5',
    contourLine: 'rgba(160, 160, 160, 0.35)',
    contourIndex: 'rgba(120, 120, 120, 0.55)',
    gridMajor: 'rgba(0, 0, 0, 0.06)',
    gridMinor: 'rgba(0, 0, 0, 0.025)',
    gridLabel: 'rgba(0, 0, 0, 0.12)',
    textPrimary: 'rgba(0, 0, 0, 0.7)',
    textSecondary: 'rgba(0, 0, 0, 0.2)',
    accent: accentColor,
    frameLine: 'rgba(0, 0, 0, 0.2)',
  };
}
