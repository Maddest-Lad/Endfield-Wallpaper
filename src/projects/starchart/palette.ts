/** Named plate stocks. `erasableSyntaxOnly` forbids enums, so: const object + union. */
export const THEMES = {
  void: 'void',
  amber: 'amber',
  naval: 'naval',
  plate: 'plate',
  survey: 'survey',
  miku: 'miku',
  blueprint: 'blueprint',
  inkwash: 'inkwash',
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'void', label: 'Void Atlas' },
  { value: 'amber', label: 'Phosphor' },
  { value: 'naval', label: 'Naval' },
  { value: 'plate', label: 'Printed Plate' },
  { value: 'survey', label: 'Deep Survey' },
  { value: 'miku', label: 'Miku' },
  { value: 'blueprint', label: 'Blueprint' },
  { value: 'inkwash', label: 'Ink Wash' },
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
  // The two hex codes are lifted verbatim from endfield's own Miku preset
  // (projects/endfield/presets.ts) — teal accent over hot-pink linework on
  // near-black. It maps onto a star chart better than a reskin has any right
  // to: the Milky Way becomes the pink haze, the trade lanes stay teal, and a
  // real star's B-V index places it somewhere between the two.
  miku: {
    ground: '#0B0D12',
    ink: '#EAF6F4',
    dim: '#5C8C88',
    star: '#F2FFFC',
    haze: '#E12885',
    warm: '#FF6FB4',
    cool: '#39C5BB',
    invert: false,
  },
  // Cyanotype: white line-work on drafting blue, with a construction-yellow
  // accent standing in for a revision mark.
  blueprint: {
    ground: '#123A66',
    ink: '#F4F8FF',
    dim: '#7FA8D9',
    star: '#FFFFFF',
    haze: '#3E6FA8',
    warm: '#FFE3B8',
    cool: '#CFEFFF',
    invert: false,
  },
  // Sumi-e: dark ink on warm washi paper, near-monochrome but for a vermillion
  // seal stamp standing in for the accent.
  inkwash: {
    ground: '#DAD3C8',
    ink: '#2B2620',
    dim: '#7A7166',
    star: '#2B2620',
    haze: '#9C9284',
    warm: '#6B4A2E',
    cool: '#3A4550',
    invert: true,
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

function toHex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Linear RGB blend, `t=0` -> `a`, `t=1` -> `b`. Simple on purpose — matches
 * every other colour computation in this file rather than reaching for a
 * perceptual space this project doesn't otherwise use. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/**
 * The active plate stock, as CSS custom properties for the control panel.
 *
 * Two derivations are worth explaining rather than eyeballing:
 *
 * `--panel-raised` is deliberately NOT `palette.ground` — it is whichever of
 * {ground, ink} is the dark one, chosen via `invert`. The panel header and
 * footer carry a hardcoded white title, so they need a band that is dark
 * regardless of the stock: for the five night-sky stocks `ground` already is
 * that dark colour, but for a light stock like Printed Plate or Ink Wash
 * `ground` is pale cream/paper and `ink` is the dark one instead. `invert` is
 * exactly the flag that already distinguishes those two families.
 *
 * `--panel-line` is `dim` blended toward `ground` rather than `dim` itself:
 * used at full strength it is too close to `ink` on some stocks (Amber's `dim`
 * is a saturated brown that reads as a second text colour, not a hairline) to
 * work as a border.
 */
export function themeVarsFor(theme: ThemeName, accentColor: string): Record<string, string> {
  const p = getPalette(theme, accentColor);
  return {
    '--project-accent': accentColor,
    '--panel-surface': p.ground,
    '--panel-raised': p.invert ? p.ink : p.ground,
    '--panel-ink': p.ink,
    '--panel-mid': p.dim,
    '--panel-line': mix(p.ground, p.dim, 0.45),
    // Same test as `--panel-raised`: `invert` is exactly "light ground, dark
    // ink", which is exactly what `color-scheme: light` means to a browser.
    '--panel-scheme': p.invert ? 'light' : 'dark',
  };
}

/**
 * A star's colour, from its real B-V index.
 *
 * `temp` runs -1 (hot blue) to +1 (cool red). The plate's own `star` ink is the
 * neutral point and the theme's warm/cool inks are the extremes, so a stylised
 * stock like the amber phosphor stays inside its own palette while still
 * ordering its stars correctly by colour. `strength` is the config dial: at 0
 * every star is plate ink, at 1 the real colour index reaches full throw.
 *
 * Returns a hex string rather than rgba, because every caller then fades it by
 * its own alpha.
 */
export function starTint(palette: Palette, temp: number, strength: number): string {
  const t = Math.max(-1, Math.min(1, temp)) * strength;
  if (Math.abs(t) < 0.002) return palette.star;
  const base = hexToRgb(palette.star);
  const target = hexToRgb(t > 0 ? palette.warm : palette.cool);
  const k = Math.abs(t);
  return toHex([
    base[0] + (target[0] - base[0]) * k,
    base[1] + (target[1] - base[1]) * k,
    base[2] + (target[2] - base[2]) * k,
  ]);
}
