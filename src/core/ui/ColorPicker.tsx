import { useRef } from 'react';
/** Neutral fallback so core/ui stays free of any project's palette. */
const DEFAULT_SWATCHES = ['#FFE600', '#FF3B30', '#00AEEF', '#34C759', '#AF52DE', '#FFFFFF', '#8A8A8A', '#1A1A1A'];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  /** Project-supplied palette; falls back to a neutral set. */
  swatches?: string[];
}

export function ColorPicker({ label, value, onChange, swatches = DEFAULT_SWATCHES }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPreset = swatches.includes(value);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-ef-mid uppercase tracking-widest">{label}</span>
      <div className="flex gap-1.5">
        {swatches.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-6 h-6 border cursor-pointer transition-all ${
              value === color ? 'border-ef-dark scale-110' : 'border-ef-border hover:border-ef-mid'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className={`relative w-6 h-6 border cursor-pointer transition-all overflow-hidden ${
            !isPreset ? 'border-ef-dark scale-110' : 'border-ef-border hover:border-ef-mid'
          }`}
          style={{ background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)` }}
        >
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
}
