/** Section label in the control panel: a yellow chevron marker plus a caption. */
export function SectionHeader({ children }: { children: string }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.3em] mb-2 mt-1">
      <span className="text-[var(--project-accent)] font-bold mr-1">{'\u203A\u203A'}</span>
      <span className="text-site-mid">{children}</span>
    </h3>
  );
}

/** Hairline rule with a diamond tick, separating panel sections. */
export function Divider() {
  return (
    <div className="flex items-center gap-1.5 my-3">
      <div className="w-1.5 h-1.5 bg-[var(--project-accent)] rotate-45" />
      <div className="flex-1 h-px bg-site-line" />
    </div>
  );
}
