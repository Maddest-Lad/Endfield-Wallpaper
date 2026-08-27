interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

export function Slider({ label, value, min, max, step, onChange, displayValue }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[var(--panel-mid)] uppercase tracking-widest">{label}</span>
        <span className="text-[11px] text-[var(--panel-mid)] font-mono">{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-[var(--panel-line)] rounded-none appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:bg-[var(--project-accent)]
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-[var(--panel-ink)]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:bg-[var(--project-accent)]
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-[var(--panel-ink)]
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:rounded-none"
      />
    </div>
  );
}
