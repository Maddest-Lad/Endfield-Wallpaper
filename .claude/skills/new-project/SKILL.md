---
name: new-project
description: Scaffold a new generative art project in this repo (a new entry in the Fieldgrid gallery). Use when the user wants to add a new generator, art experiment, sketch, or visual project - e.g. "add a flow field project", "new generator for Truchet tiles", "start a new experiment".
---

# Adding a generative art project

A project is a self-contained directory under `src/projects/<id>/` plus one line in
`src/app/registry.ts`. Nothing else in the codebase should need to change.

## Before you start

Read `src/projects/blank/` end to end — it is ~120 lines and it is the template.
Copy it, don't write from scratch:

```bash
cp -r src/projects/blank src/projects/<id>
```

Also skim `src/core/project/types.ts` for the four types you'll implement against:
`BaseConfig`, `RenderContext<C, D>`, `LayerDef<C, D>`, `Pipeline<C, D>`.

## The files

| File | What it holds |
|---|---|
| `meta.ts` | `ProjectMeta` only — id, title, tagline, thumb, cardAccent |
| `config.ts` | Your config interface, `createDefaults()`, `randomize<Name>()` |
| `store.ts` | `createProjectStore<YourConfig>({...})` |
| `pipeline.ts` | `derive`, `baseKey`, and the `LayerDef[]` table |
| `layers/*.ts` | One `draw(rc)` per layer |
| `Controls.tsx` | Panel sections, built from `@core/ui` primitives |
| `index.ts` | `defineProject({...})` as the default export |

Then register it:

```ts
// src/app/registry.ts
import { yourMeta } from '@projects/<id>/meta';

export const PROJECTS: RegistryEntry[] = [
  // ...
  { meta: yourMeta, load: () => import('@projects/<id>').then((m) => m.default) },
];
```

## Rules that are easy to get wrong

These are not style preferences — breaking any of them produces a real bug.

1. **Draw in logical pixels. Never touch `devicePixelRatio`.** The pipeline has
   already applied the DPR transform to `rc.ctx`. `rc.width`/`rc.height` are CSS
   pixels. Scaling by DPR yourself renders everything twice as large on HiDPI.

2. **Use `rc.rng`, never `Math.random()`, inside a layer.** Each layer gets its own
   deterministic stream seeded from `config.seed`. `Math.random()` breaks seed
   reproducibility, so the same permalink renders differently every time — and it
   makes layer caching visibly wrong, since a cache hit and a cache miss produce
   different pixels. `Math.random()` in `randomize()` is fine: that produces a
   *config*, not pixels.

3. **Declare `cacheKey` for every config field your layer reads that isn't in
   `baseKey`.** Layers are cached per `(name, key)`. A field that affects output
   but appears in neither key means the layer keeps serving a stale canvas and the
   control silently does nothing.

4. **Expensive work goes in `derive`, not in a layer body.** `derive` runs once per
   render and its result is shared by every layer; a layer body re-runs whenever
   that layer's cache misses. Memoise inside `derive` yourself — the pipeline does
   not cache it for you (see `projects/endfield/derive.ts` for the two-level memo
   pattern). If you have no precomputation, `derive: () => undefined` with
   `TData = void` is correct and expected.

5. **Layer `name` is public API.** It is both the cache slot and the RNG salt
   (`seed + '_' + name`). Renaming a layer changes its output for every existing
   seed and permalink. Pick names once.

6. **The first layer must be opaque and cover every pixel.** The pipeline never
   calls `clearRect` — that is what avoids a flash between frames.

7. **`meta.ts` must not import `index.ts` or anything heavy.** The registry imports
   `meta.ts` eagerly so the gallery can list the project without loading its code.
   One stray import collapses your lazy chunk into the main bundle. Verify with
   `npm run build` and check `dist/assets/` for a separate chunk.

8. **Read runtime assets through `import.meta.env.BASE_URL`.** The site is served
   from `/fieldgrid/`, so a root-absolute `fetch('/foo.svg')` 404s in production.
   Put per-project assets in `public/<id>/`.

9. **`createDefaults()` is a function for a reason.** It may read `screen` /
   `devicePixelRatio`. Doing that at module scope runs it on import, before the
   route is mounted.

10. **Presets are `Partial`.** A preset that omits a field leaves the current value
    alone. Spell out any field where "keep whatever was there" would look wrong.

## Theming

The shell is neutral. Your accent comes from `meta.cardAccent`, which the route
root exposes as the `--project-accent` CSS variable, so `@core/ui` primitives pick
it up automatically.

If your project needs its own fonts or tokens, add `src/styles/project-<id>.css`
with an `@theme` block and a `.theme-<id>` class, `@import` it from
`src/index.css`, and set `themeClass: 'theme-<id>'` in your meta.

Keep it in the eager CSS graph. Tailwind v4 generates utilities from the CSS
dependency graph at build time, and `document.fonts.load` can only resolve a
family the stylesheet has already declared — which is also why canvas fonts are
loaded via `@font-face` rather than a JS-constructed `FontFace` (Firefox mobile
doesn't reliably register those for canvas).

## Thumbnail

`public/thumbs/<id>.svg` (or `.png`), 960x540. The `discord` resolution preset is
exactly 960x540, so the easiest route is to open the project, pick a good seed,
export, and downscale. A placeholder is fine to start — a stale thumbnail is
cosmetic, not a correctness bug.

## Verify

```bash
npm run typecheck && npm run lint && npm run build
npm run dev      # then visit #/<id>
```

Check all of these before calling it done:

- the project appears on the gallery at `#/`
- every control visibly changes the canvas (a control that does nothing usually
  means a missing `cacheKey`)
- the same seed renders identically twice (reload the page)
- Export PNG produces the configured resolution
- Copy Link round-trips in a fresh tab
- `dist/assets/` has a separate chunk for the project, and the main chunk does not
  contain its dependencies
