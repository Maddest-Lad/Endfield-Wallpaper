import { useEffect, useRef } from 'react';
import { starchartStore } from './store';
import { getPalette, rgba, starTint } from './palette';
import { createSkyView } from './sky';
import { brightStars } from './catalog';
import { sampleMilkyWay } from './field';
import { CONSTELLATIONS } from './data/constellations.gen';

/**
 * The pointing globe: an orthographic celestial sphere you spin to aim the plate.
 *
 * It is built on the same `createSkyView` the plate uses, so it inherits the
 * identical rotation convention and the chart's horizontal flip for free — which
 * is what keeps "drag left" meaning the same thing in both places.
 *
 * Rotation is a TURNTABLE, not a free trackball. That is not a simplification:
 * d3's `.rotate([lon, lat, roll])` is three Euler angles and the config stores
 * exactly those three numbers, so a quaternion trackball would accumulate roll
 * the user never asked for and could not be written back into the fields. The
 * turntable maps one-to-one.
 */

/** Drawn size in CSS pixels. The panel is 288px wide with 16px of padding. */
const SIZE = 232;
/** Resolution of the Milky Way wash. Cheap, and the band has no fine detail. */
const HAZE_STEPS = 64;
/** Everything outside this fraction of the disc radius grabs the roll ring. */
const RING_INNER = 0.94;
/** Stars this bright or better are plotted. 1,627 of them. */
const GLOBE_MAG = 5;

const FOV_MIN = 6;
const FOV_MAX = 130;
/** Matches the Declination slider's own range, so the two never disagree. */
const DEC_MIN = -89;
const DEC_MAX = 89;

type DragMode = 'orient' | 'roll' | null;

export function SkyGlobe() {
  const c = starchartStore.useConfig();
  const { setConfig } = starchartStore.actions;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hazeRef = useRef<{ canvas: OffscreenCanvas; image: ImageData } | null>(null);

  /**
   * Pixels per degree at the disc centre, measured from the projection itself.
   *
   * Not derived from `fov / size`: orthographic maps angle through a sine, and
   * `createSkyView` additionally clamps the half-angle away from the projection's
   * limit, so the naive figure is out by about 1.65x and the globe runs away from
   * the cursor. Measuring a one-degree step is exact and stays correct if the
   * globe's projection or field ever changes.
   */
  const pxPerDegRef = useRef(1);

  /**
   * Live drag state.
   *
   * `ra`/`dec`/`roll` are accumulated HERE rather than read back from the config
   * on each move. Pointermoves arrive faster than React commits, so reading the
   * store would hand every move in a burst the same stale base and each would
   * overwrite the last — a drag would apply roughly one move's worth of rotation
   * no matter how far it travelled.
   */
  const dragRef = useRef<{
    mode: DragMode;
    x: number;
    y: number;
    ra: number;
    dec: number;
    rollFrom: number;
  }>({ mode: null, x: 0, y: 0, ra: 0, dec: 0, rollFrom: 0 });

  // Latest config for the pointer handlers, which are bound once and would
  // otherwise close over the values from the render that installed them.
  // Synced in an effect rather than during render: a drag can only start from a
  // user event, which is always after the commit, so this is never stale.
  const configRef = useRef(c);
  useEffect(() => {
    configRef.current = c;
  }, [c]);

  /**
   * Live field of view for the wheel handler, for the same reason the drag keeps
   * its own accumulator: a wheel gesture delivers a burst of events well inside
   * one React commit, and reading the store each time would apply a single
   * notch's worth of zoom for the whole burst. Resynced whenever the value
   * changes from anywhere else — a slider, a preset, a search result.
   */
  const fovRef = useRef(c.fieldOfView);
  useEffect(() => {
    fovRef.current = c.fieldOfView;
  }, [c.fieldOfView]);

  // --- draw ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * dpr) {
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const palette = getPalette(c.theme, c.accentColor);
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    // Leave room outside the disc for the roll ring.
    const R = SIZE / 2 - 14;

    // A wide cap rather than a strict hemisphere: `createSkyView` holds the
    // half-angle clear of the projection's limit, so this shows ~72 degrees of
    // radius and the drawn limb is exactly that edge. The last few degrees of a
    // true hemisphere are compressed into nothing anyway.
    const globe = createSkyView('orthographic', c.raCenter, c.decCenter, c.roll, 180, R * 2, R * 2);
    const toCanvas = (p: [number, number]): [number, number] => [
      p[0] + cx - R,
      p[1] + cy - R,
    ];

    // Measure the centre scale for the drag handler. One degree of declination
    // off-centre; near a pole, step the other way so the probe stays on-sphere.
    const probeDec = c.decCenter > 0 ? c.decCenter - 1 : c.decCenter + 1;
    const o = globe.project(c.raCenter, c.decCenter);
    const p1 = globe.project(c.raCenter, probeDec);
    if (o && p1) {
      const d = Math.hypot(p1[0] - o[0], p1[1] - o[1]);
      if (d > 1e-6) pxPerDegRef.current = d;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = palette.ground;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    // --- Milky Way ---
    if (!hazeRef.current) {
      const off = new OffscreenCanvas(HAZE_STEPS, HAZE_STEPS);
      const octx = off.getContext('2d');
      if (octx) {
        hazeRef.current = {
          canvas: off,
          image: octx.createImageData(HAZE_STEPS, HAZE_STEPS),
        };
      }
    }
    const haze = hazeRef.current;
    if (haze) {
      const octx = haze.canvas.getContext('2d');
      if (octx) {
        const [hr, hg, hb] = hexToRgb(palette.haze);
        const cell = (R * 2) / HAZE_STEPS;
        for (let y = 0; y < HAZE_STEPS; y++) {
          for (let x = 0; x < HAZE_STEPS; x++) {
            const sky = globe.invert((x + 0.5) * cell, (y + 0.5) * cell);
            const i = (y * HAZE_STEPS + x) * 4;
            haze.image.data[i] = hr;
            haze.image.data[i + 1] = hg;
            haze.image.data[i + 2] = hb;
            haze.image.data[i + 3] = sky
              ? Math.round(Math.pow(sampleMilkyWay(sky[0], sky[1]), 1.5) * 190)
              : 0;
          }
        }
        octx.putImageData(haze.image, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalCompositeOperation = palette.invert ? 'source-over' : 'lighter';
        ctx.drawImage(haze.canvas, cx - R, cy - R, R * 2, R * 2);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // --- graticule, 30 degree steps ---
    ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.4 : 0.26);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let lon = 0; lon < 360; lon += 30) strokeArc(ctx, globe, toCanvas, lon, -88, 88, true);
    for (let lat = -60; lat <= 60; lat += 30) strokeArc(ctx, globe, toCanvas, lat, 0, 360, false);
    ctx.stroke();

    // --- constellation figures ---
    // Very faint, but they are what make a 232px globe legible as a sky rather
    // than as a scatter of dots.
    ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.3 : 0.18);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (const con of CONSTELLATIONS) {
      for (const flat of con.paths) {
        let open = false;
        for (let i = 0; i + 1 < flat.length; i += 2) {
          const q = globe.project(flat[i], flat[i + 1]);
          if (!q) {
            open = false;
            continue;
          }
          const [px, py] = toCanvas(q);
          if (open) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          open = true;
        }
      }
    }
    ctx.stroke();

    // --- stars ---
    for (const st of brightStars(GLOBE_MAG)) {
      const q = globe.project(st.ra, st.dec);
      if (!q) continue;
      const [px, py] = toCanvas(q);
      const rel = Math.max(0, Math.min(1, (GLOBE_MAG - st.mag) / (GLOBE_MAG + 1.5)));
      const r = 0.4 + 1.9 * rel * rel;
      ctx.fillStyle = rgba(starTint(palette, st.temp, c.spectralTint), 0.35 + 0.65 * rel);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- current field footprint ---
    // Walked from the PLATE's own border and inverted, so it stays honest about
    // the plate's aspect ratio and about its projection differing from this one.
    const plate = createSkyView(
      c.projection,
      c.raCenter,
      c.decCenter,
      c.roll,
      c.fieldOfView,
      c.width,
      c.height,
    );
    ctx.strokeStyle = rgba(palette.accent, 0.95);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 64; i++) {
      const [bx, by] = borderPoint(i / 64, c.width, c.height);
      const sky = plate.invert(bx, by);
      if (!sky) {
        started = false;
        continue;
      }
      const q = globe.project(sky[0], sky[1]);
      if (!q) {
        started = false;
        continue;
      }
      const [px, py] = toCanvas(q);
      if (started) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
      started = true;
    }
    ctx.stroke();

    // --- centre crosshair ---
    ctx.strokeStyle = rgba(palette.accent, 0.9);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.lineTo(cx - 2, cy);
    ctx.moveTo(cx + 2, cy);
    ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy - 2);
    ctx.moveTo(cx, cy + 2);
    ctx.lineTo(cx, cy + 6);
    ctx.stroke();

    ctx.restore();

    // --- limb + roll ring (outside the clip) ---
    ctx.strokeStyle = rgba(palette.dim, 0.7);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    const ringR = R + 7;
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    for (let a = 0; a < 360; a += 30) {
      const rad = (a - 90) * (Math.PI / 180);
      const inner = a % 90 === 0 ? ringR - 4 : ringR - 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
      ctx.lineTo(cx + Math.cos(rad) * (ringR + 2), cy + Math.sin(rad) * (ringR + 2));
      ctx.stroke();
    }

    const rollRad = (c.roll - 90) * (Math.PI / 180);
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(rollRad) * ringR, cy + Math.sin(rollRad) * ringR, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }, [c]);

  // --- interaction ---
  // Bound imperatively rather than via onWheel/onPointerMove props: the wheel
  // listener has to be non-passive to preventDefault, and React attaches wheel
  // handlers passively.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const R = SIZE / 2 - 14;
    const centre = SIZE / 2;
    const local = (e: PointerEvent | WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left - centre, e.clientY - rect.top - centre];
    };

    const onPointerDown = (e: PointerEvent) => {
      const [dx, dy] = local(e);
      const dist = Math.hypot(dx, dy);
      if (dist > R * 1.18) return;
      canvas.setPointerCapture(e.pointerId);
      const cfg = configRef.current;
      dragRef.current = {
        mode: dist > R * RING_INNER ? 'roll' : 'orient',
        x: e.clientX,
        y: e.clientY,
        ra: cfg.raCenter,
        dec: cfg.decCenter,
        rollFrom: Math.atan2(dy, dx) * (180 / Math.PI) + 90 - cfg.roll,
      };
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.mode) return;
      e.preventDefault();

      if (drag.mode === 'roll') {
        const [dx, dy] = local(e);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90 - drag.rollFrom;
        setConfig({ roll: round1(wrap180(angle)) });
        return;
      }

      // Degrees per pixel at the disc centre, where the projection is locally
      // uniform. No 1/cos(dec) term: it would blow up at the poles, and a
      // turntable does not need one — the centre moves along its own parallel.
      const perPx = 1 / pxPerDegRef.current;
      const mx = e.clientX - drag.x;
      const my = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;

      // `createSkyView` mirrors X, so a rightward drag has to INCREASE RA for
      // the sky to travel with the cursor.
      drag.ra = wrap360(drag.ra + mx * perPx);
      // Matches the Declination slider's own range. Clamping wider would let a
      // drag push the value past where the slider can represent it, leaving the
      // thumb pinned and quietly disagreeing with the plate.
      drag.dec = Math.max(DEC_MIN, Math.min(DEC_MAX, drag.dec + my * perPx));
      setConfig({ raCenter: round1(drag.ra), decCenter: round1(drag.dec) });
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragRef.current.mode) return;
      dragRef.current.mode = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.max(
        FOV_MIN,
        Math.min(FOV_MAX, fovRef.current * Math.exp(e.deltaY * 0.0015)),
      );
      fovRef.current = next;
      setConfig({ fieldOfView: Math.round(next) });
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [setConfig]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--panel-mid)] uppercase tracking-widest">Orientation</span>
      <canvas
        ref={canvasRef}
        style={{ width: SIZE, height: SIZE, touchAction: 'none' }}
        className="self-center cursor-grab active:cursor-grabbing select-none"
      />
      <span className="text-[9px] text-[var(--panel-mid)]/70 text-center leading-tight">
        drag to aim · ring to roll · scroll to zoom
      </span>
    </div>
  );
}

// --- helpers -----------------------------------------------------------------

/** Walk the plate's border once, anticlockwise, as t goes 0..1. */
function borderPoint(t: number, w: number, h: number): [number, number] {
  const p = t * 4;
  if (p < 1) return [p * w, 0];
  if (p < 2) return [w, (p - 1) * h];
  if (p < 3) return [(3 - p) * w, h];
  return [0, (4 - p) * h];
}

function strokeArc(
  ctx: CanvasRenderingContext2D,
  view: ReturnType<typeof createSkyView>,
  toCanvas: (p: [number, number]) => [number, number],
  fixed: number,
  from: number,
  to: number,
  meridian: boolean,
): void {
  let open = false;
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    const q = meridian ? view.project(fixed, t) : view.project(t, fixed);
    if (!q) {
      open = false;
      continue;
    }
    const [px, py] = toCanvas(q);
    if (open) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
    open = true;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (!Number.isFinite(n) || h.length !== 6) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const wrap360 = (v: number) => ((v % 360) + 360) % 360;
const wrap180 = (v: number) => {
  const w = wrap360(v + 180) - 180;
  return w;
};
