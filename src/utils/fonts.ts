let fontLoaded = false;

export async function loadCanvasFont(): Promise<void> {
  if (fontLoaded) return;

  try {
    const font = new FontFace('Endfield', 'url(/fonts/EndfieldByButan.ttf)');
    const loaded = await font.load();
    document.fonts.add(loaded);
    fontLoaded = true;
  } catch (e) {
    console.warn('Failed to load Endfield font for canvas, using fallback:', e);
  }
}

const CJK_REGEX = /[\u3000-\u9FFF\uF900-\uFAFF]/;

export function fontForText(text: string, sizePx: number, bold = false): string {
  const weight = bold ? 'bold ' : '';
  if (CJK_REGEX.test(text)) {
    return `${weight}${sizePx}px 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif`;
  }
  return `${weight}${sizePx}px 'Endfield', 'Arial Black', 'Impact', sans-serif`;
}
