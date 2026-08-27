interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[11px] text-[var(--panel-mid)] uppercase tracking-widest group-hover:text-[var(--panel-ink)] transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-[var(--panel-line)] peer-checked:bg-[var(--project-accent)] transition-colors" />
        {/* The knob stays a fixed light neutral rather than following the panel
            surface: on a dark stock the surface itself is near-black, and a
            knob drawn in that colour would vanish against the track instead of
            reading as a physical switch. */}
        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white border border-[var(--panel-ink)] transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}
