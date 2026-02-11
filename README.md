# Endfield Terrain Generator

A browser-based wallpaper generator inspired by the visual design language of **Arknights: Endfield**. Produces topographic terrain maps overlaid with industrial/military HUD elements, mixed Japanese and English text labels, and print-production marks — all rendered to an HTML Canvas and exportable as high-resolution PNGs.

Everything runs **pure client-side** — no backend. Terrain generation, contour extraction, and all rendering happen in the browser.

## Features

- **Topographic contour lines** — Simplex-noise heightmaps with mono, elevation-gradient, or fade color modes, plus optional glow effects
- **Mixed-language annotations** — Scattered Japanese and English technical labels
- **Industrial overlays** — CMYK registration dots, hazard stripes, accent bars with chevron arrows, diagonal hatching, crosshair marks, diamond markers
- **Territory zones** — Voronoi-tessellated polygons with crosshatch fill, aligned to terrain features
- **HUD elements** — Grid lines, scan lines, reticle targets, data panels, corner metadata blocks
- **Hero text** — Large faint watermark rendered in the custom Endfield display font
- **7 curated presets** — Field Report, Storm Warning, Minimal Survey, Classified, Deep Terrain, Signal Lost, Holographic
- **Full customization** — Theme (light/dark), accent color, contour line color, noise parameters, 11 independent layer toggles
- **High-res export** — PNG export up to 4K, with resolution presets for desktop, phone, and ultrawide
- **Shareable permalinks** — Full config encoded in the URL hash for instant sharing

## Tech Stack

- **Build:** Vite 7, TypeScript ~5.9
- **UI:** React 19, Tailwind CSS v4
- **State:** Zustand v5
- **Noise:** simplex-noise v4, alea v1 (seeded PRNG)
- **Contours:** d3-contour v4 (marching squares)
- **Zones:** d3-delaunay v6 (Voronoi tessellation)
- **Rendering:** Canvas 2D API

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Open the app in your browser
2. Use the **control panel** on the right to adjust settings:
   - Pick a preset or customize theme, colors, terrain parameters, and layer toggles
   - Hit **Randomize** to generate a new random configuration
3. Click **Export PNG** to download at full resolution
4. Click **Copy Link** to share a permalink that reproduces the exact wallpaper

## Project Structure

```
src/
  engine/              # Pure rendering pipeline (no React)
    types.ts           # WallpaperConfig, RenderContext, ThemePalette, ContourData
    terrain.ts         # Heightmap generation (fractal simplex noise)
    contours.ts        # d3-contour extraction
    renderer.ts        # Orchestrates layer composition
    export.ts          # Full-resolution PNG export via OffscreenCanvas
    layers/            # One file per visual layer (12 layers)
  hooks/               # React hooks (Zustand store, render orchestration)
  utils/               # Color, fonts, seeded RNG, permalink encoding
  components/          # React UI (canvas, control panel, controls, primitives)
  data/                # Presets and text content pools
```

## Font Attribution

This project uses the **Endfield Font** by **Luo Butan (罗醭坦)**.

The font maps standard ASCII characters to decorative symbol glyphs decoded from miHoYo's *Arknights* and *Arknights: Endfield*. When Latin text is typed, it renders as symbolic glyphs — this is intentional and core to the Endfield aesthetic.

- **Author:** Luo Butan (罗醭坦) — [Bilibili @罗醭坦](https://space.bilibili.com/)
- **Source:** [github.com/lhclbt/Endfield_Font](https://github.com/lhclbt/Endfield_Font)
- **License:** [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (Creative Commons Attribution-NonCommercial 4.0)

The original character designs are the property of miHoYo / HyperGryphon. The font creator notes that miHoYo retains final interpretation rights over the original character designs.

## License

This project is for personal and non-commercial use. The Endfield Font included in this project is licensed under CC BY-NC 4.0 — commercial use of the font is prohibited.

*Arknights: Endfield* is a trademark of miHoYo / HyperGryphon. This project is a fan work and is not affiliated with or endorsed by miHoYo.
