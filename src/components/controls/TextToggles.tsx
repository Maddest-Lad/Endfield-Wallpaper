import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { Toggle } from '../ui/Toggle';

export function TextToggles() {
  const {
    showGrid,
    showAnnotations,
    showCjkText,
    showFrames,
    showAccents,
    showScanLines,
    showDataPanel,
    showReticles,
    showCornerData,
    showZones,
    showHeroText,
    setConfig,
  } = useWallpaperConfig();

  return (
    <div className="flex flex-col gap-2.5">
      <Toggle label="Grid" checked={showGrid} onChange={(v) => setConfig({ showGrid: v })} />
      <Toggle label="Contour Annotations" checked={showAnnotations} onChange={(v) => setConfig({ showAnnotations: v })} />
      <Toggle label="Japanese Text" checked={showCjkText} onChange={(v) => setConfig({ showCjkText: v })} />
      <Toggle label="Frames" checked={showFrames} onChange={(v) => setConfig({ showFrames: v })} />
      <Toggle label="Accents" checked={showAccents} onChange={(v) => setConfig({ showAccents: v })} />
      <Toggle label="Scan Lines" checked={showScanLines} onChange={(v) => setConfig({ showScanLines: v })} />
      <Toggle label="Data Panel" checked={showDataPanel} onChange={(v) => setConfig({ showDataPanel: v })} />
      <Toggle label="Reticles" checked={showReticles} onChange={(v) => setConfig({ showReticles: v })} />
      <Toggle label="Corner Data" checked={showCornerData} onChange={(v) => setConfig({ showCornerData: v })} />
      <Toggle label="Zones" checked={showZones} onChange={(v) => setConfig({ showZones: v })} />
      <Toggle label="Hero Text" checked={showHeroText} onChange={(v) => setConfig({ showHeroText: v })} />
    </div>
  );
}
