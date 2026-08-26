# CLAUDE.md — Fieldgrid

## Overview

Fieldgrid is a browser-based platform for **generative art experiments**. Each experiment is a
self-contained "project" that renders to an HTML canvas and exports a high-resolution PNG. A gallery
home page lists them; each has its own route.

Everything is **pure client-side** (React 19 + TypeScript + Vite + Tailwind v4 + Zustand). There is no
backend. Deployed to GitHub Pages at https://maddest-lad.github.io/fieldgrid/.

> **Adding a new project? Use the `new-project` skill** (`.claude/skills/new-project/`). It has the
> scaffold steps and, more importantly, the rules that are easy to get wrong.

## Structure

```
src/
  core/              art-agnostic. MUST NOT import from ../projects
    project/         types.ts (the four core types), defineProject.ts (AnyProject facade)
    render/          pipeline.ts (layer walker), layerCache.ts, exportPng.ts
    store/           createProjectStore.ts
    router/          hashRoute.ts, permalink.ts
    canvas/          fonts.ts
    output/          resolutions.ts
    utils/           random.ts
    ui/              Button, Slider, Toggle, Select, ColorPicker, Section — no domain knowledge

  app/               site chrome, generic over AnyProject
    App.tsx          route switch
    registry.ts      eager meta + lazy loaders + the inflight promise map
    ProjectRoute.tsx use(loadProject(id)), theme class, cache disposal
    AppShell.tsx     canvas + panel + mobile FAB
    gallery/         Gallery, ProjectCard
    shell/           CanvasStage, PanelShell, OutputSection, ResolutionPicker,
                     ActionButtons, useRenderCanvas, usePersistConfig

  projects/
    endfield/        Arknights: Endfield-styled topographic terrain maps
    starchart/       real star charts of a chosen piece of sky
      data/          GENERATED sky data — see scripts/build-sky-data.mjs
    blank/           minimal starter — copy this to begin a new project

  styles/            tokens.css (neutral site), project-endfield.css
```

Outside `src/`, `scripts/build-sky-data.mjs` regenerates `src/projects/starchart/data/`.
It is not part of `npm run build` — its output is committed — and it sits outside both
`tsconfig.app.json`'s `include` and eslint's glob on purpose.

Path aliases: `@core/*`, `@app/*`, `@projects/*`.

## The four core types

Everything else is plumbing. Full definitions in `src/core/project/types.ts`.

```ts
BaseConfig                  // width, height, preset, seed — the shell owns these
RenderContext<C, D>         // { ctx, width, height, config, data, rng } handed to each layer
LayerDef<C, D>              // { name, enabled?, cacheKey?, draw }
Pipeline<C, D>              // { fonts?, derive, baseKey, layers, disposeDerived? }
```

A project bundles these into a `ProjectDefinition<C, D>` and passes it to `defineProject()`, which
returns **`AnyProject`** — a type-erased facade. The shell holds `AnyProject` and never names a
project's config type; it receives configs opaquely and hands them straight back, which is exactly when
existential erasure is sound. Do **not** use `ProjectDefinition<any, any>` in the shell or registry.

## Rendering pipeline

`renderPipeline(pipeline, canvas, config, dpr, cache)` in `src/core/render/pipeline.ts`:

1. Await `pipeline.fonts` via `loadFonts()`.
2. Size the canvas buffer to `width * dpr`. All layer code then draws in **logical pixels** — the DPR
   transform is applied to each layer's context, so layers never think about DPR.
3. `await pipeline.derive(config, width, height)` — the project's shared precomputation.
4. For each layer whose `enabled(config)` passes: build the cache key from width, height,
   `baseKey(config)` and the layer's own `cacheKey(config, data)`, resolve it from the cache
   (rendering on miss), and `drawImage` it onto the target.

Each layer gets its own deterministic RNG stream: `createRng(config.seed + '_' + layer.name)`. This is
what lets one layer change without reshuffling the others — and it means **layer names are public
API**: renaming one changes its output for every existing seed and permalink.

The first layer must be opaque and cover every pixel; the pipeline never calls `clearRect`, which is
what avoids a flash between frames.

### Caching

Two tiers, plus whatever the project memoises inside `derive`:

- **Layer cache** (`createLayerCache()`) — one `OffscreenCanvas` per layer, keyed as above. An
  *instance*, not a module singleton: two projects can both have a `background` layer, and a project's
  canvases are freed when its route unmounts (`disposeCaches()`).
- **Export passes `cache: null`** — one-shot renders allocate and free each layer canvas as they
  composite. Caching a 4K export buys nothing and would evict every preview-sized entry.
- **Derived data** is *not* cached by the pipeline. Memoise it yourself; see
  `projects/endfield/derive.ts` for the two-level heightmap/contour memo.

**The cache contract:** any config field a layer reads must appear in `baseKey` or that layer's
`cacheKey`. Otherwise the layer serves a stale canvas and its control silently does nothing.

## State

`createProjectStore<C>()` returns `{ raw, actions, get, useConfig }`. Config is nested under a single
`config` key — this is deliberate, and it's what removed ~120 lines of hand-maintained field
enumeration (a 33-name destructure, a 33-name dep array, and a field-by-field `buildConfig()`).

- `actions` is a **stable plain object, not a hook**. Zustand v5 loops if a selector returns a
  freshly-constructed object; don't convert it into `useActions()`.
- Stores are **module-level inside each project's lazy chunk**, so they're created only when that
  project's route is entered. That's what keeps `screen`/`devicePixelRatio` reads out of module-eval.
- `createDefaults()` is a function for the same reason.
- Presets are `Partial<Omit<C, 'width'|'height'|'preset'|'seed'>>` — a preset that omits a field leaves
  the current value alone, and adding a config field never breaks existing presets.

Init priority: `?c=` route param, then `localStorage['fieldgrid:<id>:config']`, then `legacyStorageKey`,
then `createDefaults()`.

## Routing and permalinks

```
#  or  #/           gallery
#/endfield          project
#/endfield?c=<b64>  project from a permalink
#<b64>              legacy v1 link -> endfield, self-heals on first persist
```

Hash routing (hand-rolled, ~60 lines on `useSyncExternalStore`) rather than a router library plus a
404.html fallback: no deploy changes, deep links survive a refresh with no server cooperation, and
Pages never returns a 404 status for a real route.

**Never parse the config payload with `URLSearchParams`.** `btoa` output contains `+`, `/` and `=`, and
`URLSearchParams` decodes `+` as a space — which corrupts roughly half of all links into an `atob`
throw. Parse with `indexOf('?c=')`; `#` can't appear in base64, so the split is unambiguous.

`usePersistConfig` writes through `replaceConfigParam(projectId, encoded)`, which rebuilds the whole
hash from the project id rather than reading `location.hash`, so the debounced config write can't
clobber the route. It uses `replaceState`, so dragging a slider doesn't fill the history stack.

## Code splitting

Each project's `meta.ts` is imported **eagerly** by the registry (so the gallery can list it) while its
code sits behind `() => import('@projects/<id>')`. `meta.ts` must therefore import nothing heavy — one
stray import collapses the lazy chunk into the main bundle.

`loadProject(id)` returns a **stable promise** from an `inflight` Map. This is load-bearing: React 19's
`use()` re-invokes on every render, and a fresh promise would suspend forever under StrictMode.

## Theming

`styles/tokens.css` holds the neutral site palette (`--color-site-*`) plus the reset and scrollbar.
Per-project styles live in `styles/project-<id>.css` with an `@theme` block and a `.theme-<id>` class
that `ProjectRoute` applies via `meta.themeClass`.

Token *values* are global; token *application* is scoped by class. Keep both files eagerly imported
from `index.css`: Tailwind v4 generates utilities from the CSS dependency graph at build time, and an
`@theme` block reachable only from a lazy chunk can land after first paint.

`meta.cardAccent` is exposed on the route root as the `--project-accent` CSS variable, so `@core/ui`
primitives pick up the active project's accent automatically. `src/app` and `src/core` reference no
project's tokens.

Canvas fonts are loaded with `document.fonts.load("16px 'Family'")` against the CSS `@font-face`, not a
JS-constructed `FontFace` — Firefox mobile doesn't reliably register those for canvas. This is also why
`@font-face` must stay in the eager CSS graph.

## Projects

### endfield

Topographic terrain maps in the visual language of Arknights: Endfield — contour lines from
simplex-noise heightmaps, industrial HUD overlays, mixed EN/JP labels, print-production marks.

- **Derived data**: `{ palette, heightmap, contourData, gridWidth, gridHeight, terrainKey }` — fractal
  simplex noise (`terrain.ts`) fed through d3-contour marching squares (`contours.ts`), on a grid of
  ~250 cells on the longer axis. Two-level memo so changing `contourLevels` reuses the heightmap.
- **13 layers**, in order: background, grid, scanLines, contourLines, zones, heroText, annotations,
  reticles, cornerData, frames, dataPanel, accents, logoOverlay (async).
- **Contour colour modes**: `mono` | `elevation` | `fade`, plus an independent glow via `shadowBlur`.
- **Fonts**: `EndfieldByButan.ttf` maps ASCII to decorative symbol glyphs. Text rendered in it looks
  garbled — **that is intentional and desired**. `fonts.ts` routes between `endfield` / `standard` /
  `auto` (CJK-detecting) stacks.
- **8 presets** including Miku (teal accent, pink contours, `logoVariant: 'miku'`).

**Known dead config field:** `showCjkText` is plumbed through config, presets, randomize and the panel,
but **no layer reads it** — `annotations.ts` includes `JP_LABELS` unconditionally. The toggle currently
does nothing. Wiring it up means gating the JP label pool in `annotations.ts` (and the CJK footer in
`dataPanel.ts`) *and* adding a `cacheKey` on `showCjkText` to those layers, or they will render stale.

### starchart

Survey plates of a real piece of sky. The stars, their positions, magnitudes and
colours, the constellation figures, the star names and the Milky Way are all real; the
trade-lane network, the survey name and the plate notes are invented, and that split is
the point of the project.

- **Data** lives in `starchart/data/*.gen.ts`, reduced from
  [ofrohn/d3-celestial](https://github.com/ofrohn/d3-celestial) (BSD-3-Clause, itself from
  Hipparcos/Tycho and the IAU figures) by `scripts/build-sky-data.mjs`. **Regenerate with
  the script, never edit by hand.** 41,411 stars to magnitude 8 packed at 6 bytes each
  (RA u16 | Dec u16 | mag u8 | B−V u8), column-major and sorted brightest-first — which is
  what makes the limiting-magnitude cut a binary search plus a prefix walk. Positions are
  J2000, accurate to the ~7 arcsec quantisation floor. Proper motion is not applied.
- **`sky.ts`** owns the projection (`d3-geo`, five real azimuthal projections), RA/Dec ↔
  plate pixels, angular separation, sexagesimal formatting and galactic coordinates. It is
  the only place that shifts RA into d3's longitude convention, and the only place that
  applies the horizontal flip every star chart has — the sky is drawn from inside the
  sphere.
- **`derive`** projects the catalogue, clips the IAU figures, and builds a grid index so
  figure line-work can find the star at each endpoint. Two-level memo: the projection pass
  is keyed on pointing, and only the (invented) route graph re-runs when the seed changes.
- **12 layers**: plate, haze, graticule, starfield, beacons, constellations, routes,
  insets, labels, callouts, frame, titleBlock. The insets are a *second* projection of the
  same sky at 2.6–4.4× and one magnitude deeper, not a crop of the pixels above them.
- **`catalogKey` deliberately excludes the seed.** The sky is real, so rerolling the seed
  must not reshuffle it — it only rerolls the plate furniture and the trade lanes.

**The density ceiling is magnitude 8.** A narrow field is genuinely sparse: about 1,000
stars in a 48° Orion plate at mag 7.4, ~150 in a 16° one. Going deeper means a catalogue
an order of magnitude larger, so *widen the field* rather than expecting a small one to
fill in.

`data/*.gen.ts` is excluded from eslint in `eslint.config.js`: it is machine-written, and
the base64 in `stars.gen.ts` overflows the TypeScript parser's stack before any rule runs.
Emit those blobs as template literals — a `+` chain of string literals builds a binary
expression tree deep enough to trigger the same overflow.

### blank

The starter. Solid background, optional guides, four controls, `TData = void`. Copy it to begin a new
project.

## Build and deploy

```bash
npm run dev
npm run typecheck && npm run lint      # CI gates deploys on both
npm run build && npm run preview       # exercises base:'/fieldgrid/'
```

`.github/workflows/deploy.yml` runs typecheck, lint, build, then Pages on push to `main`.

**Never change `base: '/fieldgrid/'` in `vite.config.ts`.** Every shared permalink is
`https://maddest-lad.github.io/fieldgrid/#...`; changing it 404s all of them. The repo name is
independent of it.

TypeScript runs with `strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` (no
`enum` — use const objects and unions) and `verbatimModuleSyntax` (every type-only import needs
`import type`).

There is no test runner. Verification is manual — see the checklist in the `new-project` skill.
