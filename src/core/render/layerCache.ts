interface LayerEntry {
  canvas: OffscreenCanvas;
  key: string;
}

export interface LayerCache {
  /**
   * Return the cached canvas for `name` if its key and dimensions still match,
   * otherwise render a fresh one via `paint` and store it.
   */
  resolve(
    name: string,
    key: string,
    bufW: number,
    bufH: number,
    dpr: number,
    paint: (ctx: CanvasRenderingContext2D) => void | Promise<void>,
  ): Promise<OffscreenCanvas>;
  /** Free every backing store held by this cache. */
  dispose(): void;
}

/**
 * Per-project layer canvas cache.
 *
 * Deliberately an instance rather than a module singleton: two projects can both
 * have a layer named 'background' without colliding, and a project's canvases can
 * be freed when its route unmounts.
 */
export function createLayerCache(): LayerCache {
  const entries = new Map<string, LayerEntry>();

  return {
    async resolve(name, key, bufW, bufH, dpr, paint) {
      const entry = entries.get(name);
      if (entry && entry.key === key && entry.canvas.width === bufW && entry.canvas.height === bufH) {
        return entry.canvas;
      }
      const oc = new OffscreenCanvas(bufW, bufH);
      const ctx = oc.getContext('2d') as unknown as CanvasRenderingContext2D;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await paint(ctx);
      entries.set(name, { canvas: oc, key });
      return oc;
    },

    dispose() {
      // Zeroing the dimensions releases the backing store immediately. Dropping
      // the reference alone leaves it alive until GC, which on mobile Safari is
      // late enough to OOM when switching between projects.
      for (const { canvas } of entries.values()) {
        canvas.width = 0;
        canvas.height = 0;
      }
      entries.clear();
    },
  };
}
