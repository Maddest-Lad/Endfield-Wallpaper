/**
 * Pieces of sky worth pointing at.
 *
 * A uniformly random direction is, statistically, an unremarkable patch of
 * Cetus — real and correct and completely dull. These are the fields that
 * actually carry something: a bright figure, a star cloud, a cluster.
 *
 * Coordinates are J2000, RA in degrees. `fov` is the field width that frames the
 * subject; the randomiser jitters it rather than using it exactly.
 */
export interface SkyRegion {
  name: string;
  ra: number;
  dec: number;
  fov: number;
}

export const SKY_REGIONS: SkyRegion[] = [
  { name: 'Orion', ra: 83.5, dec: 0, fov: 45 },
  { name: 'Galactic Core', ra: 266.4, dec: -28.9, fov: 60 },
  { name: 'Cygnus Rift', ra: 310.0, dec: 42.0, fov: 50 },
  { name: 'Crux & Carina', ra: 175.0, dec: -60.0, fov: 55 },
  { name: 'Ursa Major', ra: 175.0, dec: 55.0, fov: 60 },
  { name: 'Scorpius', ra: 245.0, dec: -30.0, fov: 55 },
  { name: 'Pleiades', ra: 56.75, dec: 24.1, fov: 24 },
  { name: 'Cassiopeia', ra: 15.0, dec: 60.0, fov: 45 },
  { name: 'Sagittarius Cloud', ra: 275.0, dec: -22.0, fov: 38 },
  { name: 'Southern Cross', ra: 187.5, dec: -59.0, fov: 30 },
  { name: 'Leo & Virgo', ra: 175.0, dec: 10.0, fov: 70 },
  { name: 'Vela Supernova', ra: 128.0, dec: -45.0, fov: 48 },
  { name: 'Andromeda', ra: 12.0, dec: 40.0, fov: 45 },
  { name: 'Magellanic Clouds', ra: 65.0, dec: -68.0, fov: 60 },
  { name: 'Summer Triangle', ra: 295.0, dec: 30.0, fov: 65 },
  { name: 'Perseus Arm', ra: 50.0, dec: 45.0, fov: 50 },
];

/** The named region nearest a pointing, if the plate is anywhere near one. */
export function nearestRegion(ra: number, dec: number): SkyRegion | null {
  const d2r = Math.PI / 180;
  let best: SkyRegion | null = null;
  let bestSep = Infinity;
  for (const r of SKY_REGIONS) {
    const cos =
      Math.sin(dec * d2r) * Math.sin(r.dec * d2r) +
      Math.cos(dec * d2r) * Math.cos(r.dec * d2r) * Math.cos((ra - r.ra) * d2r);
    const sep = Math.acos(Math.min(1, Math.max(-1, cos))) / d2r;
    if (sep < bestSep) {
      bestSep = sep;
      best = r;
    }
  }
  // Beyond 25 degrees the name stops describing what is on the plate.
  return bestSep <= 25 ? best : null;
}
