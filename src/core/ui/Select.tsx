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
      <span className="text-[11px] text-[var(--panel-mid)] uppercase tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // The native dropdown POPUP is a separate rendering surface the CSS
        // above never reaches — `bg-transparent` only paints the closed box.
        // Without an explicit `color-scheme` the popup always uses the
        // browser's own light background, so a dark stock's light `panel-ink`
        // text renders light-on-light. `--panel-scheme` (light/dark, from
        // `themeVarsFor`) tells the browser which built-in popup palette to
        // use; the `<option>` colours below then layer the real palette on
        // top of that as far as browsers let a script reach into native UI.
        style={{ colorScheme: 'var(--panel-scheme, light)' } as React.CSSProperties}
        className="bg-transparent border border-[var(--panel-line)] text-[var(--panel-ink)] text-xs uppercase tracking-wider
          px-2 py-1.5 cursor-pointer appearance-none
          font-sans
          hover:border-[var(--panel-mid)] focus:border-[var(--project-accent)] focus:outline-none"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ backgroundColor: 'var(--panel-surface)', color: 'var(--panel-ink)' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
