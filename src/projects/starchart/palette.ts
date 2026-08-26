/** Named plate stocks. `erasableSyntaxOnly` forbids enums, so: const object + union. */
export const THEMES = {
  void: 'void',
  amber: 'amber',
  naval: 'naval',
  plate: 'plate',
  survey: 'survey',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'void', label: 'Void Atlas' },
  { value: 'amber', label: 'Phosphor' },
  { value: 'naval', label: 'Naval' },
  { value: 'plate', label: 'Printed Plate' },
  { value: 'survey', label: 'Deep Survey' },
];

export interface Palette {
  /** Opaque plate stock. */
  ground: string;
  /** Primary rule + text colour. */
  ink: string;
  /** Secondary/faint rule colour. */
  dim: string;
  /** Base star colour. */
  star: string;
  /** Galactic haze wash. */
  haze: string;
  /** Warm/cool spectral tints for a minority of stars. */
  warm: string;
  cool: string;
  accent: string;
  /**
   * True for dark-ink-on-cream stocks. Bloom must not use additive blending
   * there, and haze reads as a stain rather than a glow.
   */
  invert: boolean;
}

const STOCKS: Record<ThemeName, Omit<Palette, 'accent'>> = {
  void: {
    ground: '#05070C',
    ink: '#E6ECF6',
    dim: '#7F8CA3',
    star: '#F2F6FF',
    haze: '#9DB0CE',
    warm: '#FFD2A8',
    cool: '#AEC9FF',
    invert: false,
  },
  amber: {
    ground: '#0A0703',
    ink: '#FFC066',
    dim: '#9E6B24',
    star: '#FFD9A0',
    haze: '#C58C3A',
    warm: '#FFB347',
    cool: '#FFE9C4',
    invert: false,
  },
  naval: {
    ground: '#03121B',
    ink: '#D2EAF6',
    dim: '#5A90A9',
    star: '#E6F5FF',
    haze: '#69A6C4',
    warm: '#FFE0B8',
    cool: '#9FD8FF',
    invert: false,
  },
  plate: {
    ground: '#EAE2D0',
    ink: '#1E2226',
    dim: '#6C6858',
    star: '#22262B',
    haze: '#8C8570',
    warm: '#7A5230',
    cool: '#3A4A63',
    invert: true,
  },
  survey: {
    ground: '#04060A',
    ink: '#DCE6F2',
    dim: '#6E7B92',
    star: '#EAF1FF',
    haze: '#8FA6C8',
    warm: '#FFC79A',
    cool: '#9FBEFF',
    invert: false,
  },
};

export function getPalette(theme: ThemeName, accent: string): Palette {
  return { ...STOCKS[theme], accent };
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (!Number.isFinite(n) || h.length !== 6) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Hex + alpha -> rgba() string. Canvas has no other way to fade a named colour. */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function rgbTriplet(hex: string): [number, number, number] {
  return hexToRgb(hex);
}
