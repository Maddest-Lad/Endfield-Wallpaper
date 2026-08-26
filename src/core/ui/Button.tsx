interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'font-sans uppercase tracking-widest text-xs px-5 py-2.5 transition-all cursor-pointer';
  const variants = {
    primary: 'bg-[var(--project-accent)] text-site-ink hover:brightness-110 active:brightness-95',
    secondary:
      'bg-transparent text-site-ink border border-site-line hover:border-site-mid active:bg-site-ink/5',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
