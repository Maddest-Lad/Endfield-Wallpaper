interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[11px] text-site-mid uppercase tracking-widest group-hover:text-site-ink transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-site-line peer-checked:bg-[var(--project-accent)] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white border border-site-ink transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}
