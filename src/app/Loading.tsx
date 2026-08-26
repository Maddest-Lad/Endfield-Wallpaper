/** Shown while a project's chunk loads. Matches the canvas PROCESSING indicator. */
export function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center gap-3 bg-site-paper">
      <div className="flex gap-1">
        <span className="w-1.5 h-5 bg-site-accent animate-[pulse-bar_0.8s_ease-in-out_infinite]" />
        <span className="w-1.5 h-5 bg-site-accent animate-[pulse-bar_0.8s_ease-in-out_0.15s_infinite]" />
        <span className="w-1.5 h-5 bg-site-accent animate-[pulse-bar_0.8s_ease-in-out_0.3s_infinite]" />
      </div>
      <span className="text-sm text-site-mid uppercase tracking-[0.25em]">Loading</span>
    </div>
  );
}
