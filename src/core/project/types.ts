import type { ResolutionPreset } from '../output/resolutions';

/**
 * The fields the shell owns and every project must carry. Projects extend this
 * with whatever their own art needs.
 */
export interface BaseConfig {
  width: number;
  height: number;
  preset: ResolutionPreset;
  seed: string;
}

/**
 * What a layer's draw function receives.
 *
 * `width`/`height` are LOGICAL pixels — the device-pixel-ratio transform is
 * already applied to `ctx`, so layer code must never scale by dpr itself.
 */
export interface RenderContext<C extends BaseConfig, D> {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  config: C;
  /** Whatever the pipeline's `derive` step produced. */
  data: D;
  /** Deterministic, seeded per (config.seed, layer.name). Never use Math.random(). */
  rng: () => number;
}

/**
 * One cached, composited canvas layer.
 *
 * NOTE: `name` is effectively public API. It is both the cache slot and the RNG
 * salt (`seed + '_' + name`), so renaming a layer silently changes its output
 * for every existing seed and permalink.
 */
export interface LayerDef<C extends BaseConfig, D> {
  name: string;
  /** Omitted means the layer is always drawn. */
  enabled?: (config: C) => boolean;
  /**
   * Cache dimensions BEYOND the pipeline's `baseKey`. Any config field this
   * layer reads that isn't already in `baseKey` must appear here, or the layer
   * will render stale.
   */
  cacheKey?: (config: C, data: D) => string;
  draw: (rc: RenderContext<C, D>) => void | Promise<void>;
}

export interface Pipeline<C extends BaseConfig, D> {
  /** Font families to await before any layer draws. */
  fonts?: string[];
  /**
   * Expensive per-config precomputation shared by all layers. Memoise inside —
   * the pipeline does not cache this for you.
   */
  derive: (config: C, width: number, height: number) => D | Promise<D>;
  /** Config fields every layer depends on. Combined with width/height by the walker. */
  baseKey: (config: C) => string;
  /** Composition order: index 0 draws first (bottom). */
  layers: LayerDef<C, D>[];
  /** Release anything `derive` memoised. */
  disposeDerived?: () => void;
}
