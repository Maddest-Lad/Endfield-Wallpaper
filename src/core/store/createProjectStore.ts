import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { BaseConfig } from '../project/types';
import { type ResolutionPreset, resolveResolution } from '../output/resolutions';
import { randomSeed } from '../utils/random';
import { decodeConfig, loadSavedConfig } from '../router/permalink';

export interface ProjectPreset<C extends BaseConfig> {
  name: string;
  /**
   * Partial on purpose: a preset that omits a field leaves the current value
   * alone, and adding a config field never breaks existing presets.
   */
  config: Partial<Omit<C, 'width' | 'height' | 'preset' | 'seed'>>;
}

export interface ProjectActions<C extends BaseConfig> {
  setConfig: (patch: Partial<C>) => void;
  setResolutionPreset: (preset: ResolutionPreset) => void;
  randomize: () => void;
  applyPreset: (name: string) => void;
  reset: () => void;
}

export interface ProjectStore<C extends BaseConfig> {
  raw: StoreApi<{ config: C }>;
  /** Stable plain object — safe to destructure anywhere, never triggers a re-render. */
  actions: ProjectActions<C>;
  get(): C;
  useConfig(): C;
  useConfig<U>(selector: (config: C) => U): U;
}

export interface ProjectStoreOptions<C extends BaseConfig> {
  projectId: string;
  /** Lazy: may read screen/devicePixelRatio, so it must not run at module scope. */
  createDefaults: () => C;
  randomize: (current: C) => Partial<C>;
  presets: ProjectPreset<C>[];
  /** Base64 config from the route, if the user followed a permalink. */
  initialConfigParam?: string | null;
  /** Pre-namespacing localStorage key, read once so returning users keep their config. */
  legacyStorageKey?: string;
}

function loadLegacy<C extends BaseConfig>(key: string, defaults: C): C | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.width === 'number' && typeof parsed.seed === 'string') {
      return { ...defaults, ...parsed } as C;
    }
    return null;
  } catch {
    return null;
  }
}

export function createProjectStore<C extends BaseConfig>(
  opts: ProjectStoreOptions<C>,
): ProjectStore<C> {
  const defaults = opts.createDefaults();

  const initial =
    decodeConfig(opts.initialConfigParam, defaults) ??
    loadSavedConfig(opts.projectId, defaults) ??
    (opts.legacyStorageKey ? loadLegacy(opts.legacyStorageKey, defaults) : null) ??
    defaults;

  const raw = createStore<{ config: C }>(() => ({ config: initial }));

  const patch = (p: Partial<C>) =>
    raw.setState((s) => ({ config: { ...s.config, ...p } }));

  const actions: ProjectActions<C> = {
    setConfig: patch,
    setResolutionPreset: (preset) => patch(resolveResolution(preset) as Partial<C>),
    randomize: () => patch(opts.randomize(raw.getState().config)),
    applyPreset: (name) => {
      const preset = opts.presets.find((p) => p.name === name);
      if (preset) patch({ ...preset.config, seed: randomSeed() } as Partial<C>);
    },
    reset: () => raw.setState({ config: opts.createDefaults() }),
  };

  function useConfig(): C;
  function useConfig<U>(selector: (config: C) => U): U;
  function useConfig(selector?: (config: C) => unknown) {
    return useStore(raw, (s) => (selector ? selector(s.config) : s.config));
  }

  return { raw, actions, get: () => raw.getState().config, useConfig };
}
