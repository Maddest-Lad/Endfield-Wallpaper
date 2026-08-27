import type { ComponentType, ReactNode } from 'react';
import type { BaseConfig, Pipeline } from './types';
import type { ResolutionPreset } from '../output/resolutions';
import type { ProjectStore } from '../store/createProjectStore';
import { createLayerCache } from '../render/layerCache';
import { renderPipeline } from '../render/pipeline';
import { encodeConfig } from '../router/permalink';

export interface ProjectMeta {
  /** Route segment, localStorage namespace, and public asset directory. */
  id: string;
  title: string;
  tagline: string;
  version: string;
  /** Path relative to BASE_URL, e.g. 'thumbs/endfield.png'. */
  thumb: string;
  /** Hex accent for this project's gallery card. */
  cardAccent: string;
  /** CSS class applied to the route root, e.g. 'theme-endfield'. */
  themeClass?: string;
  /** Rendered in the control panel footer. */
  attribution?: ReactNode;
}

export interface RenderRequest {
  width: number;
  height: number;
  dpr: number;
  target: 'preview' | 'export';
}

/** What a project module authors. Fully generic over its own config and derived data. */
export interface ProjectDefinition<C extends BaseConfig, D> {
  meta: ProjectMeta;
  store: ProjectStore<C>;
  pipeline: Pipeline<C, D>;
  /** Reads its own store module directly; takes no props. */
  Controls: ComponentType;
  exportName?: (config: C) => string;
  /**
   * Panel chrome colours derived from the live config, as CSS custom property
   * values (e.g. `{ '--panel-surface': '#EAE2D0' }`). Optional: a project that
   * omits this renders the panel with the neutral site palette, exactly as
   * before this existed. `core`/`app` never interpret these values or know
   * what they mean — they are applied verbatim as inline style on the panel
   * root, which is what keeps this from becoming a project naming its tokens
   * to the shell.
   */
  themeVars?: (config: C) => Record<string, string>;
}

/**
 * The type-erased facade the shell and registry hold.
 *
 * The shell never names a project's config type and never constructs one — it
 * receives configs opaquely and hands them straight back. That's exactly when
 * existential erasure is sound, which is why this is a hand-written facade
 * rather than ProjectDefinition<any, any>.
 */
export interface AnyProject {
  readonly meta: ProjectMeta;
  readonly Controls: ComponentType;
  /** Reactive; the returned object is referentially stable between edits. */
  useConfig(): BaseConfig;
  getConfig(): BaseConfig;
  setResolutionPreset(preset: ResolutionPreset): void;
  setDimensions(patch: { width?: number; height?: number }): void;
  randomize(): void;
  applyPreset(name: string): void;
  render(canvas: HTMLCanvasElement | OffscreenCanvas, req: RenderRequest): Promise<void>;
  /**
   * `{}` for a project with no `themeVars`. See `ProjectDefinition.themeVars`.
   *
   * Takes the config explicitly rather than reading `def.store.get()` itself —
   * a caller deriving this inside a `useMemo` needs the same value in the
   * dependency array as the one the callback actually reads, or the effect
   * can't tell when to recompute (and a lint rule that can catch that mistake
   * won't, since it only sees a store peek with no argument to depend on).
   */
  getThemeVars(config: BaseConfig): Record<string, string>;
  encodeConfig(): string;
  exportFileName(): string;
  /** Free every OffscreenCanvas this project holds. Call when its route unmounts. */
  disposeCaches(): void;
}

export function defineProject<C extends BaseConfig, D>(
  def: ProjectDefinition<C, D>,
): AnyProject {
  const previewCache = createLayerCache();

  return {
    meta: def.meta,
    Controls: def.Controls,

    useConfig: () => def.store.useConfig(),
    getConfig: () => def.store.get(),

    setResolutionPreset: (preset) => def.store.actions.setResolutionPreset(preset),
    // Sound because C extends BaseConfig, but TypeScript can't infer that a
    // Partial of the base is assignable to a Partial of the extension.
    setDimensions: (patch) => def.store.actions.setConfig(patch as Partial<C>),
    randomize: () => def.store.actions.randomize(),
    applyPreset: (name) => def.store.actions.applyPreset(name),

    // Sound for the same reason `setDimensions` casting `patch` is: C extends
    // BaseConfig, but TypeScript can't see that a caller holding a BaseConfig
    // it got from THIS project's own `useConfig()` is actually holding a C.
    getThemeVars: (config) => def.themeVars?.(config as C) ?? {},

    render: (canvas, req) =>
      renderPipeline(
        def.pipeline,
        canvas,
        { ...def.store.get(), width: req.width, height: req.height },
        req.dpr,
        // Export is one-shot: caching a 4K render buys nothing and would evict
        // every preview-sized layer.
        req.target === 'preview' ? previewCache : null,
      ),

    encodeConfig: () => encodeConfig(def.store.get()),

    exportFileName: () => {
      const c = def.store.get();
      return def.exportName?.(c) ?? `${def.meta.id}-${c.seed}-${c.width}x${c.height}.png`;
    },

    disposeCaches: () => {
      previewCache.dispose();
      def.pipeline.disposeDerived?.();
    },
  };
}
