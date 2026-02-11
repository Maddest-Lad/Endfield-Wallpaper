interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-ef-mid uppercase tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border border-ef-border text-ef-dark text-xs uppercase tracking-wider
          px-2 py-1.5 cursor-pointer appearance-none
          font-endfield
          hover:border-ef-mid focus:border-ef-yellow focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
