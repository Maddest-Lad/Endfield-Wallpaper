interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'font-endfield uppercase tracking-widest text-xs px-5 py-2.5 transition-all cursor-pointer';
  const variants = {
    primary: 'bg-ef-yellow text-ef-dark hover:brightness-110 active:brightness-95',
    secondary:
      'bg-transparent text-ef-dark border border-ef-border hover:border-ef-mid active:bg-ef-dark/5',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
