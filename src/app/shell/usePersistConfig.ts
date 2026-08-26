import { useEffect } from 'react';
import type { BaseConfig } from '@core/project/types';
import { encodeConfig, saveConfig } from '@core/router/permalink';
import { replaceConfigParam } from '@core/router/hashRoute';

/**
 * Mirror the config into the URL hash and localStorage.
 *
 * Deliberately separate from the render path: this used to run inside the render
 * callback, coupling URL writes to render completion for no reason. replaceState
 * (not pushState) so dragging a slider doesn't fill the history stack.
 */
export function usePersistConfig<C extends BaseConfig>(projectId: string, config: C): void {
  useEffect(() => {
    const id = setTimeout(() => {
      const encoded = encodeConfig(config);
      if (!encoded) return;
      replaceConfigParam(projectId, encoded);
      saveConfig(projectId, config);
    }, 150);
    return () => clearTimeout(id);
  }, [projectId, config]);
}
