/**
 * Every tone in the plate is derived from three config hexes: the star, the
 * structure, and the accent. Layers never read a raw config colour — they read
 * this palette, which is what keeps the five presets reading as five different
 * looks rather than five recolours of the same three elements.
 */

export type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n) || full.length !== 6) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** h in [0, 360), s and l in [0, 1]. */
function rgbToHsl(rgb: Rgb): [number, number, number] {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const wrapHue = (h: number) => ((h % 360) + 360) % 360;

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${wrapHue(h).toFixed(1)}, ${(clamp01(s) * 100).toFixed(1)}%, ${(clamp01(l) * 100).toFixed(1)}%, ${clamp01(a)})`;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hh = wrapHue(h) / 360;
  const ss = clamp01(s);
  const ll = clamp01(l);
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return [v, v, v];
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const channel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [
    Math.round(channel(hh + 1 / 3) * 255),
    Math.round(channel(hh) * 255),
    Math.round(channel(hh - 1 / 3) * 255),
  ];
}

/** `rgba(...)` with an explicit alpha — the only safe way to fade a gradient to nothing. */
export function rgba(rgb: Rgb, a: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamp01(a)})`;
}

export interface DysonPalette {
  voidInner: string;
  voidOuter: string;
  /** Three tinted plumes, as raw channels so the nebula buffer can add them. */
  nebulaRgb: Rgb[];
  starBright: string;
  starDim: string;

  coreRgb: Rgb;
  coreWhite: string;
  coreBright: string;
  coreMid: string;
  coreRim: string;

  panelVoid: string;
  panelDark: string;
  panelBase: string;
  panelEdge: string;
  panelLit: string;
  panelHot: string;
  /** Bare framework where a panel is missing. */
  ghost: string;

  structureRgb: Rgb;
  structureDark: string;
  structure: string;
  structureLit: string;

  accentRgb: Rgb;
  accent: string;
  accentSoft: string;

  beam: string;
  line: string;
  text: string;
  textDim: string;
}

export function makePalette(
  coreColor: string,
  structureColor: string,
  accentColor: string,
): DysonPalette {
  const core = rgbToHsl(hexToRgb(coreColor));
  const struct = rgbToHsl(hexToRgb(structureColor));
  const acc = rgbToHsl(hexToRgb(accentColor));

  const coreH = core[0];
  const coreS = Math.max(0.25, core[1]);
  const structH = struct[0];
  const structS = struct[1];
  const accH = acc[0];
  const accS = Math.max(0.3, acc[1]);

  // The void borrows the structure hue so the plate reads as one colour system,
  // but sits far enough down in lightness that additive passes have somewhere to go.
  const voidInner = hsl(structH + 6, Math.min(0.6, structS * 0.9), 0.075);
  const voidOuter = hsl(structH - 14, Math.min(0.7, structS * 0.8), 0.022);

  return {
    voidInner,
    voidOuter,
    nebulaRgb: [
      hslToRgb(coreH, Math.min(0.85, coreS + 0.2), 0.5),
      hslToRgb(structH + 28, Math.min(0.85, structS + 0.25), 0.44),
      hslToRgb(accH - 22, Math.min(0.8, accS), 0.4),
    ],
    starBright: hsl(coreH, 0.15, 0.96),
    starDim: hsl(structH, 0.2, 0.78),

    coreRgb: hslToRgb(coreH, coreS, 0.62),
    coreWhite: hsl(coreH, 0.1, 0.99),
    coreBright: hsl(coreH, Math.min(0.6, coreS * 0.7), 0.9),
    coreMid: hsl(coreH, coreS, 0.66),
    coreRim: hsl(coreH - 12, Math.min(0.95, coreS + 0.25), 0.5),

    panelVoid: hsl(structH, structS * 0.5, 0.05),
    panelDark: hsl(structH - 4, structS * 0.55, 0.11),
    panelBase: hsl(structH, structS * 0.5, 0.17),
    panelEdge: hsl(structH + 8, structS * 0.7, 0.34),
    panelLit: hsl(coreH, Math.min(0.9, coreS + 0.1), 0.58),
    panelHot: hsl(coreH, 0.4, 0.88),
    ghost: hsl(structH, structS * 0.6, 0.26),

    structureRgb: hslToRgb(structH, structS, 0.55),
    structureDark: hsl(structH - 6, structS * 0.55, 0.09),
    structure: hsl(structH, structS * 0.7, 0.36),
    structureLit: hsl(structH + 10, Math.min(0.8, structS * 0.8), 0.66),

    accentRgb: hslToRgb(accH, accS, 0.62),
    accent: hsl(accH, accS, 0.62),
    accentSoft: hsl(accH, accS * 0.8, 0.42),

    beam: hsl(coreH, Math.min(0.5, coreS * 0.6), 0.92),
    line: hsl(structH, structS * 0.5, 0.55),
    text: hsl(structH, 0.12, 0.86),
    textDim: hsl(structH, 0.18, 0.52),
  };
}
