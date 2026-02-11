import { useWallpaperConfig } from '../../hooks/useWallpaperConfig';

const ACCENT_PRESETS = [
  '#FFE600', // Endfield Yellow
  '#FF4444', // Red
  '#00AEEF', // Cyan
  '#4ADE80', // Green
  '#A855F7', // Purple
  '#FFFFFF', // White
];

export function ThemeControls() {
  const { theme, accentColor, setConfig } = useWallpaperConfig();

  return (
    <div className="flex flex-col gap-3">
      {/* Theme toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setConfig({ theme: 'light' })}
          className={`flex-1 text-[10px] uppercase tracking-widest py-1.5 border cursor-pointer transition-colors ${
            theme === 'light'
              ? 'bg-ef-dark text-ef-light border-ef-dark'
              : 'bg-transparent text-ef-mid border-ef-border hover:border-ef-mid'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setConfig({ theme: 'dark' })}
          className={`flex-1 text-[10px] uppercase tracking-widest py-1.5 border cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'bg-ef-dark text-ef-light border-ef-dark'
              : 'bg-transparent text-ef-mid border-ef-border hover:border-ef-mid'
          }`}
        >
          Dark
        </button>
      </div>

      {/* Accent color */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-ef-mid uppercase tracking-widest">Accent</span>
        <div className="flex gap-1.5">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setConfig({ accentColor: color })}
              className={`w-6 h-6 border cursor-pointer transition-all ${
                accentColor === color ? 'border-ef-dark scale-110' : 'border-ef-border hover:border-ef-mid'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
