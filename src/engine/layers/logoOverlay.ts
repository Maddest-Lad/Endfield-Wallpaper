import type { RenderContext } from '../types';

const LOGO_FILES: Record<string, string> = {
  industries: 'endfield-industries.svg',
  en: 'endfield-logo-en.svg',
  ja: 'endfield-logo-ja.svg',
  ko: 'endfield-logo-ko.svg',
  zh: 'endfield-logo-zh.svg',
};

const svgCache = new Map<string, string>();

async function fetchSvgText(variant: string): Promise<string | null> {
  if (svgCache.has(variant)) return svgCache.get(variant)!;
  const file = LOGO_FILES[variant];
  if (!file) return null;
  try {
    const url = `${import.meta.env.BASE_URL}endfield/${file}`;
    const res = await fetch(url);
    const text = await res.text();
    svgCache.set(variant, text);
    return text;
  } catch {
    return null;
  }
}

function loadImage(svgText: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

export async function drawLogoOverlay(rc: RenderContext): Promise<void> {
  const { ctx, width, height, config, palette } = rc;
  const variant = config.logoVariant ?? 'none';
  if (variant === 'none') return;

  const svgText = await fetchSvgText(variant);
  if (!svgText) return;

  // Inject fill color and opacity into the SVG root element
  const color = config.logoColor || palette.textPrimary;
  const opacity = config.logoOpacity ?? 0.15;
  const colored = svgText.replace('<svg', `<svg fill="${color}" fill-opacity="${opacity}"`);

  const img = await loadImage(colored);

  // Scale: logo width = canvas width * logoScale, maintain aspect ratio
  const scale = config.logoScale ?? 0.3;
  const aspect = img.naturalWidth / img.naturalHeight;
  const logoW = width * scale;
  const logoH = logoW / aspect;

  // Center on canvas
  const x = (width - logoW) / 2;
  const y = (height - logoH) / 2;

  ctx.save();
  ctx.drawImage(img, x, y, logoW, logoH);
  ctx.restore();
}
