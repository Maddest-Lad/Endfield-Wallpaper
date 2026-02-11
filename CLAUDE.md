# CLAUDE.md — Endfield Terrain Generator

## Overview

WallpaperV2 is a browser-based wallpaper generator inspired by the visual design language of **Arknights: Endfield**. It produces topographic terrain maps overlaid with industrial/military HUD elements, mixed Japanese and English text labels, and print-production marks -- all rendered to an HTML Canvas and exportable as high-resolution PNGs.

Everything runs **pure client-side** (React + TypeScript + Tailwind). There is no backend; terrain generation, contour extraction, and all rendering happen in the browser. Users configure the output through a control panel, then export or share a permalink.

### Visual Aesthetic

The design draws from Endfield's packaging, merchandise, and in-game UI (reference images in `style/` and `style_v2/`). Key visual traits:

- **Color palette** -- Yellow (#FFE600) is the signature accent, with support for red, cyan, green, purple, white, gray, and black alternates. Light and dark themes swap the background between off-white (#F5F5F5) and near-black (#1A1A1A). Both accent and contour line colors are independently user-selectable from the same 8-color palette plus a custom color picker.
- **Topographic contour lines** -- Simplex-noise heightmaps produce organic contour lines in mono, elevation-gradient, or fade color modes. Contour line color is independently configurable from the accent color. An optional glow effect (via Canvas `shadowBlur`) can be layered on top of any color mode, controlled by an intensity slider.
- **Mixed-language text** -- Japanese labels (e.g. "暴雨予警", "地形調査", "探査レベル") and English labels ("TERRAIN SURVEY", "VALLEY PASS", "MOUNTAIN CONTOUR") are scattered as annotations. CJK text uses Noto Sans JP / system CJK fonts; technical readouts use a clean sans-serif.
- **Industrial marks** -- CMYK registration dots, hazard stripes, yellow accent bars with chevron arrows stamped "ARKNIGHTS: ENDFIELD", diagonal hatching patches, small scattered crosshair (+) marks, diamond accent markers (solid and hatched), corner brackets, center crosshairs, and edge midpoint ticks.
- **Territory zones** -- Irregular angular polygons generated via Voronoi tessellation (d3-delaunay), filled with diagonal crosshatch lines. Seed points are biased toward heightmap peaks/valleys so zone boundaries semi-align with contour features. Zones are merged using contour-threshold-aligned elevation bands with gradient-aware constraints, then isolated so no two zones share edges.
- **HUD overlays** -- Grid lines, scan lines, reticle targets, data panels (with translucent background) with coordinates/elevation/frequency readouts, and corner metadata blocks.

### The Endfield Font

`public/fonts/EndfieldByButan.ttf` is a custom display font where standard ASCII characters map to **decorative symbol glyphs** (geometric shapes, arrows, custom marks). When you type normal Latin text, it renders as seemingly garbled symbols. **This is intentional and desired** -- the garbled look IS the Endfield aesthetic. The font is used for hero text, accent bar labels, and the control panel header title.

The control panel itself uses `font-sans` (system sans-serif) for readability. Canvas text routing is handled by `src/utils/fonts.ts` which selects between `'endfield'`, `'standard'` (Inter/Helvetica), or `'auto'` (CJK detection) font stacks depending on the text content and intended use.

### User Experience

The app is a single full-viewport layout with two regions:

**Canvas preview (left)** -- Shows a scaled-down live preview of the wallpaper with corner-bracket decorations, a "TERRAIN_PREVIEW" label, and the current resolution display. The canvas re-renders whenever config changes.

**Control panel (right, 288px sidebar)** -- A scrollable panel organized into labeled sections:

1. **Presets** -- Seven curated style buttons that apply a full config snapshot (all settings except resolution and seed).
2. **Resolution** -- Dropdown for 1080p, 1440p, 4K, phone (1170x2532), ultrawide (3440x1440), or custom width/height inputs.
3. **Theme** -- Light/dark toggle and accent color picker (8 preset swatches + custom color input).
4. **Terrain Parameters** -- Seed text input plus sliders for noise scale, octaves, persistence, and contour levels.
5. **Contour Style** -- Tri-state selector for contour color mode (mono, elevation, fade), contour line color picker (8 swatches + custom), and glow intensity slider.
6. **Layers** -- Eleven independent toggles controlling which overlay layers are drawn (grid, annotations, Japanese text, frames, accents, scan lines, data panel, reticles, corner data, zones, hero text).
7. **Action Buttons** -- Randomize (re-rolls all parameters, colors, toggles, and contour mode), Export PNG, Copy Link.

### Preset System

Seven curated presets, each a complete config snapshot:

| Preset | Theme | Accent | Character |
|---|---|---|---|
| Field Report | Light | Yellow | Default survey look, all overlays on, no hero text |
| Storm Warning | Dark | Yellow | Dense contours (28 levels, 6 octaves), elevation coloring, hero text |
| Minimal Survey | Light | Grey | Stripped-down: no annotations, no CJK, no accents, fade contours |
| Classified | Dark | Red | Selective overlays, hero text, mono contours |
| Deep Terrain | Light | Yellow | High-detail (30 levels, 5 octaves), elevation coloring |
| Signal Lost | Dark | Cyan | Low-detail, minimal overlays, reticles + scan lines only |
| Holographic | Dark | Amber | Elevation contours with full glow, amber line color, minimal overlays |

Presets do NOT override resolution or seed, so users can apply a style then fine-tune dimensions and terrain independently.

### Export and Sharing

- **PNG Export** -- Renders at full configured resolution (up to 4K) using `OffscreenCanvas` when available, falls back to a DOM canvas. Downloads as `endfield-terrain-{seed}-{width}x{height}.png`.
- **Permalink** -- The full `WallpaperConfig` object is JSON-serialized, base64-encoded, and placed in the URL hash fragment (`#<base64>`). Sharing this URL reproduces the exact wallpaper. The URL is updated via `history.replaceState` (no page reload) and decoded on load.

---

## Tech Stack

- **Build**: Vite 7, TypeScript ~5.9
- **UI**: React 19, Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`)
- **State**: Zustand v5 (flat store, no middleware)
- **Noise**: simplex-noise v4 (`createNoise2D`), alea v1 (seeded PRNG)
- **Contours**: d3-contour v4 (marching squares)
- **Zones**: d3-delaunay v6 (Voronoi tessellation)
- **Rendering**: Canvas 2D API (no WebGL)
- **Lint**: ESLint 9, typescript-eslint

## Project Structure

```
src/
  engine/              # Pure rendering pipeline (no React)
    types.ts           # WallpaperConfig, RenderContext, ThemePalette, ContourData
    terrain.ts         # Heightmap generation (fractal simplex noise)
    contours.ts        # d3-contour extraction
    renderer.ts        # Orchestrates layer composition
    export.ts          # Full-resolution PNG export via OffscreenCanvas
    layers/            # One file per visual layer
      background.ts    # Solid fill
      grid.ts          # Major/minor grid + coordinate labels
      scanLines.ts     # Faint horizontal/vertical scan lines
      contourLines.ts  # Contour paths with color modes + glow
      heroText.ts      # Large faint watermark word
      annotations.ts   # Scattered technical labels (EN/JP)
      reticles.ts      # Tactical crosshair/diamond/square symbols
      cornerData.ts    # Environmental readouts, coordinates, classification stamp
      frames.ts        # Border rectangle, corner brackets, center crosshair, edge ticks
      dataPanel.ts     # Structured data panel (bottom-right) with translucent background
      zones.ts         # Territory zone polygons with crosshatch fill (Voronoi + heightmap)
      accents.ts       # Yellow bars with chevrons, hazard stripes, CMYK dots, hatching patches, scattered crosshairs, diamond markers
  hooks/
    useWallpaperConfig.ts   # Zustand store + defaults + resolution presets
    useGenerateWallpaper.ts # Debounced re-render on config change
  utils/
    color.ts           # getPalette() — light/dark ThemePalette builder, derives contour colors from config
    fonts.ts           # fontForText() — triple font system with CJK detection
    random.ts          # Seeded PRNG helpers (createRng, randomInRange, shuffle, etc.)
    permalink.ts       # Config <-> base64 URL hash encoding
  components/
    WallpaperCanvas.tsx     # Canvas element + useGenerateWallpaper hook
    ControlPanel.tsx        # Sidebar layout for all controls
    controls/               # Individual control groups
      ActionButtons.tsx     # Export, Randomize, Copy Link
      NoiseControls.tsx     # Seed, scale, octaves, persistence, lacunarity
      ContourControls.tsx   # Contour color mode selector, line color picker, glow slider
      ThemeControls.tsx     # Light/dark, accent color picker
      ResolutionPicker.tsx  # Preset + custom dimensions
      PresetPicker.tsx      # Named preset selector
      TextToggles.tsx       # Toggle switches for overlay layers
    ui/                     # Reusable primitives (Button, Slider, Toggle, Select, ColorPicker)
  data/
    presets.ts         # Named config presets (Field Report, Storm Warning, ..., Holographic)
    textContent.ts     # EN_LABELS, JP_LABELS, DATA_LABELS string pools
```

## Rendering Pipeline

`renderWallpaper(canvas, config, dpr)` in `src/engine/renderer.ts` executes a synchronous pipeline:

1. **Font loading** -- `loadCanvasFont()` loads the custom Endfield `.ttf` via the FontFace API (cached after first load).
2. **HiDPI buffer setup** -- Canvas buffer is set to `width * dpr` x `height * dpr`, then `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` so all drawing uses logical coordinates.
3. **Grid sizing** -- The heightmap grid targets ~250 cells on the longer axis, maintaining the output aspect ratio.
4. **Heightmap generation** -- `generateHeightmap()` in `terrain.ts` produces a `Float64Array` of fractal octave simplex noise, normalized to [0, 1]. Each octave multiplies frequency by `lacunarity` and amplitude by `persistence`.
5. **Contour extraction** -- `extractContours()` in `contours.ts` feeds the heightmap into `d3-contour`'s marching-squares generator with `smooth(true)`, returning `ContourData[]` (threshold value + MultiPolygon coordinates).
6. **RenderContext assembly** -- Bundles `ctx`, dimensions, config, contour data, heightmap, a seeded RNG (`seed + '_render'`), and the `ThemePalette`.
7. **Layer composition** -- Draws layers in fixed order (see below). Each layer receives the full `RenderContext`. Toggle-gated layers are skipped when their `show*` flag is false.

## Render Layers (composition order)

| # | Layer | File | Toggle | Description |
|---|-------|------|--------|-------------|
| 1 | **background** | `background.ts` | always | Solid fill using `palette.background` |
| 2 | **grid** | `grid.ts` | `showGrid` | Major (1/8 width) and minor (1/32 width) grid lines with alphanumeric coordinate labels at intersections |
| 3 | **scanLines** | `scanLines.ts` | `showScanLines` | 3-6 faint horizontal + 2-4 vertical lines at random positions, plus one dashed accent line |
| 4 | **contourLines** | `contourLines.ts` | always | Draws all contour paths scaled from grid-space to canvas-space. Every 5th contour is an "index" contour (thicker). Color varies by `contourColorMode`. Optional glow via `contourGlow` intensity (Canvas `shadowBlur` in accent color) |
| 5 | **zones** | `zones.ts` | `showZones` | 3-5 irregular angular territory polygons with diagonal crosshatch fill and border strokes. Generated via Voronoi tessellation with terrain-biased seed points, contour-aligned banding, and gradient-aware merging. Zones are isolated (no shared edges). 1-2 zones highlighted with accent border, each labeled from `EN_LABELS` |
| 6 | **heroText** | `heroText.ts` | `showHeroText` | A single large word rendered as a very faint watermark (6% opacity) with shadow echo and accent underline. Uses the Endfield font |
| 7 | **annotations** | `annotations.ts` | `showAnnotations` | 10-16 scattered text labels chosen from EN, JP (if CJK enabled), and data-format pools. Zone-based placement across a 4x3 grid prevents clustering |
| 8 | **reticles** | `reticles.ts` | `showReticles` | 2-4 tactical targeting symbols (circle, diamond, or square variant) biased toward canvas corners |
| 9 | **cornerData** | `cornerData.ts` | `showCornerData` | Top-left: environmental readouts. Top-right: lat/lon coordinates + grid reference. Bottom-left: classification ID stamp |
| 10 | **frames** | `frames.ts` | `showFrames` | Inner border rectangle, L-shaped corner brackets, center crosshair with circle, and edge midpoint ticks |
| 11 | **dataPanel** | `dataPanel.ts` | `showDataPanel` | Structured info panel in bottom-right: translucent background, accent-colored header bar, 5-7 key/value rows, optional CJK footer |
| 12 | **accents** | `accents.ts` | `showAccents` | Yellow accent bars with chevron arrows and label text, hazard stripe patch, CMYK registration dots, diagonal hatching patches, small scattered crosshair (+) marks, diamond accent markers (solid and hatched) |

## Contour Color Modes

Controlled by `config.contourColorMode` (`ContourColorMode` type):

- **`mono`** (default) -- Uniform color. Index contours use `palette.contourIndex`, others use `palette.contourLine`. Full opacity.
- **`elevation`** -- Contour color lerps from `config.contourColor` (low elevation) to `palette.accent` (high elevation) based on normalized threshold index. Hex-channel linear interpolation via `lerpColor()`.
- **`fade`** -- Same colors as mono, but opacity scales from 15% (low elevation) to 100% (high elevation). Lower contours fade out, higher ones are prominent.

### Contour Glow

`config.contourGlow` (0-1 float) layers a Canvas `shadowBlur` glow effect on top of **any** color mode. When > 0, contour strokes emit light in the accent color. Index contours glow stronger (up to 12px blur) than regular contours (up to 6px). The glow intensity is purely visual and does not affect contour geometry.

### Contour Line Color

`config.contourColor` (hex string, default `#888888`) controls the base color of contour lines independently from the theme. `getPalette()` in `color.ts` derives `palette.contourLine` and `palette.contourIndex` from this hex value using `hexToRgba()` with theme-appropriate alpha (dark: 0.25/0.45, light: 0.4/0.6).

## Color Picker

`src/components/ui/ColorPicker.tsx` is a shared component used for both accent color and contour line color selection. It provides 8 preset color swatches (yellow, red, cyan, green, purple, white, gray, black) plus a custom color button (rainbow gradient) that opens the native `<input type="color">` picker.

## State Management

Zustand flat store in `src/hooks/useWallpaperConfig.ts`. The store type is `WallpaperStore extends WallpaperConfig` -- every config field is a top-level store property (no nesting).

**Actions:**
- `setConfig(partial)` -- Shallow merge any config fields
- `setPreset(preset)` -- Switch resolution preset, updating width/height from `RESOLUTION_PRESETS` lookup
- `randomize()` -- Rerolls seed, noise params, theme, accent/contour color (linked), contour mode, glow, and all layer toggles. Resolution is preserved.
- `applyPreset(name)` -- Applies a named preset from `PRESETS` array (with fresh seed)

**Initialization:** On load, `getInitialConfig()` attempts `decodeConfig(window.location.hash)`. Falls back to `DEFAULTS` if hash is absent or invalid.

**Backwards compatibility:** New config fields (`contourGlow`, `contourColor`) use `?? defaultValue` fallbacks in both the renderer and UI components, so old permalinks without these fields still work.

## DPR / HiDPI Scaling

The canvas buffer is scaled by `devicePixelRatio` for sharp rendering on HiDPI displays. All layer code draws in logical pixel coordinates -- the transform handles physical pixel mapping. For preview, `useGenerateWallpaper` caps the logical size at **1200px** on the longest axis, then scales the buffer by the device's DPR. The canvas CSS size is pinned to the logical preview size so the browser doesn't stretch.

For export, `exportWallpaper()` renders at full target resolution with `dpr=1` (no extra scaling), producing a pixel-exact PNG.

## Triple Font System

`src/utils/fonts.ts` provides `fontForText(text, sizePx, bold?, style?)` returning a CSS font string for canvas:

| Style | Font Stack | Usage |
|-------|-----------|-------|
| `'endfield'` | `'Endfield', 'Arial Black', 'Impact', sans-serif` | Custom decorative font. Used for hero text, accent bar labels, data panel header |
| `'standard'` | `'Inter', 'Helvetica Neue', 'Arial', sans-serif` | Clean sans-serif for data readouts, coordinates, grid labels |
| `'auto'` (default) | CJK regex detection -> CJK or standard | CJK text gets `'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif`. Non-CJK falls through to standard |

## Permalink System

`src/utils/permalink.ts` implements shareable URLs:

- **Encode**: `encodeConfig(config)` -> `JSON.stringify` -> `btoa` -> base64 string
- **Decode**: `decodeConfig(hash)` -> strip leading `#` -> `atob` -> `JSON.parse` -> validate
- **URL update**: `updateUrlHash(config)` calls `history.replaceState` to set the hash without triggering navigation
- **Hydration**: Store calls `decodeConfig(window.location.hash)` during initialization

## Important: Manual Config Field Propagation

**Two files manually list every `WallpaperConfig` field and MUST be updated when adding new config fields:**

1. **`src/hooks/useGenerateWallpaper.ts`** -- Destructures all fields from the store, rebuilds the config object, and lists every field in the `useCallback` dependency array. A missing field means config changes won't trigger re-render.
2. **`src/components/controls/ActionButtons.tsx`** -- `buildConfig()` manually copies every field from the store into a `WallpaperConfig` object. A missing field means exports and permalink copies will have incomplete config.

Both also need updating in the `PRESETS` array in `src/data/presets.ts` (each preset must specify every non-omitted config field).
