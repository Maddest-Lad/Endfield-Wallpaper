import alea from 'alea';

export function createRng(seed: string): () => number {
  return alea(seed);
}

export function randomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function randomInRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(rng, min, max + 1));
}

export function randomPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
