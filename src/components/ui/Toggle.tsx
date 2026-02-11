interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[10px] text-ef-mid uppercase tracking-widest group-hover:text-ef-dark transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-ef-border peer-checked:bg-ef-yellow transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white border border-ef-dark transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}
