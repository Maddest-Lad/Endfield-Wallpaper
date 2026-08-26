# Fieldgrid

A browser-based platform for generative art experiments. Each experiment is a self-contained project
with its own controls, presets, and PNG export; a gallery home page lists them, and each has its own
shareable route.

Live at **https://maddest-lad.github.io/fieldgrid/**

![Example Generation](example.png)

## Projects

### Endfield

A wallpaper and map generator inspired by the visual style of Arknights: Endfield. It creates
topographic terrain maps layered with industrial HUD graphics, mixed Japanese and English labels, and
print-style markings.

- Procedural terrain using simplex noise with multiple color and glow options
- Scattered Japanese and English technical-style labels
- Industrial graphics like registration marks, hazard stripes, chevrons, hatching, and markers
- Voronoi-based territory zones aligned to terrain features
- HUD-style elements including grids, scan lines, reticles, and data blocks
- Large faint background text using the Endfield display font
- Eight built-in presets

### Blank Canvas

A minimal starter — solid background, optional guides, a handful of controls. It exists to be copied
when starting a new experiment.

## Platform features

- Shared render core: cached, composited canvas layers with deterministic per-layer seeding
- High-resolution PNG export up to 4K, plus device-resolution and social presets
- Shareable links that preserve the full configuration
- Per-project lazy loading, so the gallery stays small no matter how many experiments accumulate
- Responsive layout with a slide-out control drawer on mobile

## Tech Stack

- Build: Vite, TypeScript
- UI: React, Tailwind CSS
- State management: Zustand
- Noise generation: simplex-noise, alea
- Contours and zones: d3-contour, d3-delaunay
- Rendering: Canvas 2D API

## Getting Started

```bash
npm install
npm run dev
npm run build
npm run preview
```
## Usage

1. Open the app and pick a project from the gallery
2. Use the control panel to adjust presets, colors, and settings
3. Use Randomize to generate a new layout
4. Export a PNG or copy a link to share the exact result

## Project structure

```
src/
  core/       Art-agnostic: render pipeline, layer cache, store factory, router, UI primitives
  app/        Site chrome: gallery, routing, canvas stage, control panel shell
  projects/   One directory per experiment
    endfield/
    blank/    Minimal starter — copy this to begin a new project
  styles/     Neutral site tokens plus per-project themes
```

## Adding a project

A project is a directory under `src/projects/<id>/` plus one line in `src/app/registry.ts`. Copy
`src/projects/blank/`, fill in the config, pipeline and controls, and register it.

See [CLAUDE.md](CLAUDE.md) for the architecture, and `.claude/skills/new-project/` for a step-by-step
checklist including the non-obvious rules (draw in logical pixels, use the seeded RNG, declare cache
keys).
## Disclaimer

This is an unofficial fan project derived from Arknights: Endfield. It is not affiliated with, endorsed by, or associated with Yostar, HyperGryphon, or miHoYo (HoYoverse) in any way.

Arknights and Arknights: Endfield are trademarks of miHoYo / HyperGryphon. All game assets, character designs, and related intellectual property belong to their respective owners.

This project is created under the [Arknights Re-Creation Terms and Conditions](https://arknights.global/fankit/guidelines) for non-profit, non-commercial fan use only. It may not be used for any commercial purpose.

## Font Attribution

The custom display font (`EndfieldByButan.ttf`) is created by Luo Butan (罗醭坦).

- Author: Luo Butan - Bilibili @罗醭坦
- Source: [github.com/lhclbt/Endfield_Font](https://github.com/lhclbt/Endfield_Font)
- License: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (Creative Commons Attribution-NonCommercial 4.0)

The original character designs referenced by the font are the property of miHoYo / HyperGryphon. The font creator notes that miHoYo retains final interpretation rights over the original character designs.

## Icon Attribution

The logo icons (Endfield Industries and localized variants) are created by Yue-plus.

- Author: Yue-plus
- Source: [github.com/Yue-plus/endfield_icons](https://github.com/Yue-plus/endfield_icons)
- License: [MIT](https://opensource.org/licenses/MIT)

## License

This project is for personal and non-commercial use only, in accordance with the Arknights fan content guidelines. You may not use this project or its output for any commercial purpose.

The Endfield Font included in this project is licensed under CC BY-NC 4.0 - commercial use of the font is prohibited. If you redistribute or adapt this project, you must retain the font attribution above.
