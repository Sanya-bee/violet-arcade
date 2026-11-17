export type Dir = 'L' | 'R' | 'U' | 'D'
export type Grid = number[][]
export const N = 4
export const emptyGrid = (): Grid => Array.from({ length: N }, () => Array(N).fill(0))
export function addTile(g: Grid, rnd: () => number = Math.random): Grid {
  const free: [number, number][] = []
  g.forEach((r, i) => r.forEach((v, j) => { if (!v) free.push([i, j]) }))
  if (!free.length) return g
  const [i, j] = free[Math.floor(rnd() * free.length)], n = g.map(r => r.slice())
  n[i][j] = rnd() < 0.9 ? 2 : 4
  return n
}
function line(a: number[]) {
  const v = a.filter(Boolean), out: number[] = []; let gain = 0
  for (let i = 0; i < v.length; i++) { if (v[i] === v[i + 1]) { out.push(v[i] * 2); gain += v[i] * 2; i++ } else out.push(v[i]) }
  while (out.length < N) out.push(0)
  return { out, gain }
}
export function slide(g: Grid, d: Dir): { grid: Grid; gained: number; moved: boolean } {
  const n = emptyGrid(); let gained = 0
  for (let k = 0; k < N; k++) {
    const at = (m: number): [number, number] => d === 'L' ? [k, m] : d === 'R' ? [k, N - 1 - m] : d === 'U' ? [m, k] : [N - 1 - m, k]
    const { out, gain } = line(Array.from({ length: N }, (_, m) => { const [i, j] = at(m); return g[i][j] }))
    gained += gain; out.forEach((v, m) => { const [i, j] = at(m); n[i][j] = v })
  }
  return { grid: n, gained, moved: n.some((r, i) => r.some((v, j) => v !== g[i][j])) }
}
export const canMove = (g: Grid) => (['L', 'R', 'U', 'D'] as Dir[]).some(d => slide(g, d).moved)
