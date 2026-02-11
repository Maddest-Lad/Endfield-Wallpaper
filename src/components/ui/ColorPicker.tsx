import { useRef } from 'react';

const COLOR_PRESETS = [
  '#FFE600', // Endfield Yellow
  '#FF4444', // Red
  '#00AEEF', // Cyan
  '#4ADE80', // Green
  '#A855F7', // Purple
  '#FFFFFF', // White
  '#888888', // Gray
  '#1A1A1A', // Black
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPreset = COLOR_PRESETS.includes(value);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-ef-mid uppercase tracking-widest">{label}</span>
      <div className="flex gap-1.5">
        {COLOR_PRESETS.map((color) => (
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
