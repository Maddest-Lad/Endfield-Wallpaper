import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';
import { ColorPicker } from '../ui/ColorPicker';

export function ThemeControls() {
  const { theme, accentColor, setConfig } = useWallpaperConfig();

  return (
    <div className="flex flex-col gap-3">
      {/* Theme toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setConfig({ theme: 'light' })}
          className={`flex-1 text-[11px] uppercase tracking-widest py-1.5 border cursor-pointer transition-colors ${
            theme === 'light'
              ? 'bg-ef-dark text-ef-light border-ef-dark'
              : 'bg-transparent text-ef-mid border-ef-border hover:border-ef-mid'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setConfig({ theme: 'dark' })}
          className={`flex-1 text-[11px] uppercase tracking-widest py-1.5 border cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'bg-ef-dark text-ef-light border-ef-dark'
              : 'bg-transparent text-ef-mid border-ef-border hover:border-ef-mid'
          }`}
        >
          Dark
        </button>
      </div>

      <ColorPicker
        label="Accent"
        value={accentColor}
        onChange={(color) => setConfig({ accentColor: color })}
      />
    </div>
  );
}
