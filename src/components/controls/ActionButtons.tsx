import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { exportWallpaper } from '../../engine/export';
import { Button } from '../ui/Button';
import { useState } from 'react';
import type { WallpaperConfig } from '../../engine/types';

export function ActionButtons() {
  const store = useWallpaperConfig();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const config: WallpaperConfig = {
        width: store.width,
        height: store.height,
        preset: store.preset,
        theme: store.theme,
        accentColor: store.accentColor,
        seed: store.seed,
        noiseScale: store.noiseScale,
        octaves: store.octaves,
        persistence: store.persistence,
        lacunarity: store.lacunarity,
        contourLevels: store.contourLevels,
        paperGrain: store.paperGrain,
        showGrid: store.showGrid,
        showAnnotations: store.showAnnotations,
        showCjkText: store.showCjkText,
        showFrames: store.showFrames,
        showAccents: store.showAccents,
        showScanLines: store.showScanLines,
        showDataPanel: store.showDataPanel,
        showReticles: store.showReticles,
        showCornerData: store.showCornerData,
        showHeroText: store.showHeroText,
      };
      await exportWallpaper(config);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => store.randomize()}>RANDOMIZE</Button>
      <Button variant="secondary" onClick={handleExport} disabled={exporting}>
        {exporting ? 'EXPORTING...' : 'EXPORT PNG'}
      </Button>
    </div>
  );
}
