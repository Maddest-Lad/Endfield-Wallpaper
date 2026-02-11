import type { ThemeMode, ThemePalette } from '../engine/types';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getPalette(theme: ThemeMode, accentColor: string, contourColor: string): ThemePalette {
  if (theme === 'dark') {
    return {
      background: '#1A1A1A',
      contourLine: hexToRgba(contourColor, 0.25),
      contourIndex: hexToRgba(contourColor, 0.45),
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
    contourLine: hexToRgba(contourColor, 0.4),
    contourIndex: hexToRgba(contourColor, 0.6),
    gridMajor: 'rgba(0, 0, 0, 0.06)',
    gridMinor: 'rgba(0, 0, 0, 0.025)',
    gridLabel: 'rgba(0, 0, 0, 0.12)',
    textPrimary: 'rgba(0, 0, 0, 0.7)',
    textSecondary: 'rgba(0, 0, 0, 0.2)',
    accent: accentColor,
    frameLine: 'rgba(0, 0, 0, 0.2)',
  };
}
