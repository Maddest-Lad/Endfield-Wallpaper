import { useMemo, useRef, useState } from 'react';
import { starchartStore } from './store';
import { searchSky, type SkyTarget } from './search';
import { formatRaShort, formatDecShort } from './sky';

/**
 * Aim the plate by name: stars, constellations, or the named regions.
 *
 * Deliberately not a `@core/ui` primitive. The row shape here is domain
 * specific — a kind badge, a designation, a magnitude, a coordinate — and
 * `core/ui` is documented as holding nothing that knows about a project. If a
 * second project ever wants a combobox, extract it then.
 */

const KIND_MARK: Record<SkyTarget['kind'], string> = {
  star: '✦',
  constellation: '△',
  region: '◇',
};

export function StarSearch() {
  const { setConfig } = starchartStore.actions;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The index builds on first query and is memoised inside search.ts; this memo
  // just avoids re-querying it on every unrelated re-render of the panel.
  const results = useMemo(() => searchSky(query), [query]);

  const choose = (t: SkyTarget) => {
    // Only targets with a real extent touch the field of view. Picking a single
    // star re-points and leaves the framing exactly as it was.
    setConfig(
      t.fov === undefined
        ? { raCenter: round(t.ra), decCenter: round(t.dec) }
        : { raCenter: round(t.ra), decCenter: round(t.dec), fieldOfView: Math.round(t.fov) },
    );
    setQuery('');
    setOpen(false);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
      return;
    }
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[Math.min(active, results.length - 1)]);
    }
  };

  const showList = open && results.length > 0;

  return (
    <div className="flex flex-col gap-1 relative">
      <span className="text-[11px] text-[var(--panel-mid)] uppercase tracking-widest">Find</span>
      <input
        type="text"
        value={query}
        placeholder="Betelgeuse, α Ori, Orion…"
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        // Blur fires before the option's click handler, so closing immediately
        // would cancel the pick. Defer past the click.
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
        className="bg-transparent border border-[var(--panel-line)] text-[var(--panel-ink)] text-xs
          px-2 py-1.5 font-sans w-full
          placeholder:text-[var(--panel-mid)]/60
          hover:border-[var(--panel-mid)] focus:border-[var(--project-accent)] focus:outline-none"
      />

      {showList && (
        <ul
          className="absolute top-full left-0 right-0 z-20 mt-0.5 max-h-64 overflow-y-auto
            custom-scrollbar bg-[var(--panel-surface)] border border-[var(--panel-line)] shadow-lg"
        >
          {results.map((t, i) => (
            <li key={`${t.kind}:${t.label}:${t.ra.toFixed(3)}`}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseDown={() => clearTimeout(blurTimer.current)}
                onClick={() => choose(t)}
                className={`w-full text-left px-2 py-1.5 cursor-pointer flex items-baseline gap-1.5
                  ${i === active ? 'bg-[var(--panel-ink)]/5' : ''}`}
              >
                <span className="text-[var(--project-accent)] text-[10px] shrink-0">
                  {KIND_MARK[t.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-[var(--panel-ink)] uppercase tracking-wider truncate">
                    {t.label}
                  </span>
                  <span className="block text-[9px] text-[var(--panel-mid)] truncate">{t.detail}</span>
                </span>
                <span className="text-[9px] text-[var(--panel-mid)] font-mono shrink-0">
                  {formatRaShort(t.ra)} {formatDecShort(t.dec)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Match the RA/Dec sliders' 0.5 step granularity so the value reads cleanly. */
function round(v: number): number {
  return Math.round(v * 10) / 10;
}
