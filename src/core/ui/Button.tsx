interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'font-sans uppercase tracking-widest text-xs px-5 py-2.5 transition-all cursor-pointer';
  const variants = {
    // Text here contrasts the ACCENT, not the panel — every accent in the
    // palette is chosen bright enough for near-black text, so this stays the
    // fixed site ink rather than following the theme the way panel text does.
    primary: 'bg-[var(--project-accent)] text-site-ink hover:brightness-110 active:brightness-95',
    secondary:
      'bg-transparent text-[var(--panel-ink)] border border-[var(--panel-line)] hover:border-[var(--panel-mid)] active:bg-[var(--panel-ink)]/5',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
