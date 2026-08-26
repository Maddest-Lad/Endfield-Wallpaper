const loaded = new Map<string, Promise<void>>();

/**
 * Ensure each font family is ready for canvas drawing.
 *
 * Deliberately resolves against the CSS `@font-face` declaration rather than
 * constructing a `FontFace` in JS — Firefox mobile doesn't reliably register
 * JS-created FontFace instances for canvas. This is why project @font-face rules
 * must stay in the eagerly-imported CSS graph: `document.fonts.load` can only
 * resolve a family the stylesheet has already declared.
 */
export function loadFonts(families: string[]): Promise<void> {
  if (families.length === 0) return Promise.resolve();

  return Promise.all(
    families.map((family) => {
      let pending = loaded.get(family);
      if (!pending) {
        pending = document.fonts
          .load(`16px '${family}'`)
          .then(() => undefined)
          .catch((e) => {
            console.warn(`Failed to load font '${family}' for canvas, using fallback:`, e);
          });
        loaded.set(family, pending);
      }
      return pending;
    }),
  ).then(() => undefined);
}
