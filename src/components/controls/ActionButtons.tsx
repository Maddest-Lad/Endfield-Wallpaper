import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { exportWallpaper } from '../../engine/export';
import { encodeConfig } from '../../utils/permalink';
import { Button } from '../ui/Button';
import { useState } from 'react';
import type { WallpaperConfig } from '../../engine/types';

function buildConfig(store: ReturnType<typeof useWallpaperConfig>): WallpaperConfig {
  return {
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
    contourColorMode: store.contourColorMode,
    contourGlow: store.contourGlow,
    contourColor: store.contourColor,
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
}

export function ActionButtons() {
  const store = useWallpaperConfig();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportWallpaper(buildConfig(store));
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const config = buildConfig(store);
    const encoded = encodeConfig(config);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => store.randomize()}>RANDOMIZE</Button>
      <Button variant="secondary" onClick={handleExport} disabled={exporting}>
        {exporting ? 'EXPORTING...' : 'EXPORT PNG'}
      </Button>
      <Button variant="secondary" onClick={handleCopyLink}>
        {copied ? 'COPIED!' : 'COPY LINK'}
      </Button>
    </div>
  );
}
