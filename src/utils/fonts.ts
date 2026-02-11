let fontLoaded = false;

export async function loadCanvasFont(): Promise<void> {
  if (fontLoaded) return;

  try {
    // Use the CSS @font-face declaration rather than creating a separate
    // FontFace object — Firefox mobile doesn't reliably register JS-created
    // FontFace instances for canvas drawing.
    await document.fonts.load("16px 'Endfield'");
    fontLoaded = true;
  } catch (e) {
    console.warn('Failed to load Endfield font for canvas, using fallback:', e);
  }
}

export type FontStyle = 'endfield' | 'standard' | 'auto';

const CJK_REGEX = /[\u3000-\u9FFF\uF900-\uFAFF]/;

const FONT_ENDFIELD = "'Endfield', 'Arial Black', 'Impact', sans-serif";
const FONT_STANDARD = "'Inter', 'Helvetica Neue', 'Arial', sans-serif";
const FONT_CJK = "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";

/**
 * Returns a CSS font string for canvas text.
 *   'endfield'  — custom Endfield branding font (titles, hero text, accent labels)
 *   'standard'  — clean sans-serif (data readouts, coordinates, technical labels)
 *   'auto'      — detects CJK → CJK font, otherwise standard sans-serif
 */
export function fontForText(
  text: string,
  sizePx: number,
  bold = false,
  style: FontStyle = 'auto',
): string {
  const weight = bold ? 'bold ' : '';

  if (style === 'endfield') {
    return `${weight}${sizePx}px ${FONT_ENDFIELD}`;
  }

  if (style === 'standard') {
    return `${weight}${sizePx}px ${FONT_STANDARD}`;
  }

  // 'auto' — CJK detection
  if (CJK_REGEX.test(text)) {
    return `${weight}${sizePx}px ${FONT_CJK}`;
  }
  return `${weight}${sizePx}px ${FONT_STANDARD}`;
}
