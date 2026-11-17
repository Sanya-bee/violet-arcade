export function shuffle<T>(a: T[], rnd: () => number = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const BOX = (i: number) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)
// Поиск решений с выбором клетки с минимумом кандидатов. limit=2 достаточно, чтобы проверить единственность.
export function search(b: number[], limit: number, rnd?: () => number): { count: number; first: number[] | null } {
  const rows = Array(9).fill(0), cols = Array(9).fill(0), boxes = Array(9).fill(0), g = b.slice()
  for (let i = 0; i < 81; i++) if (g[i]) {
    const bit = 1 << g[i], r = Math.floor(i / 9), c = i % 9
    if (rows[r] & bit || cols[c] & bit || boxes[BOX(i)] & bit) return { count: 0, first: null }
    rows[r] |= bit; cols[c] |= bit; boxes[BOX(i)] |= bit
  }
  let count = 0; let first: number[] | null = null
  const rec = (): void => {
    if (count >= limit) return
    let bi = -1, bm = 0, bn = 10
    for (let i = 0; i < 81; i++) if (!g[i]) {
      const m = ~(rows[Math.floor(i / 9)] | cols[i % 9] | boxes[BOX(i)]) & 0x3fe
      let n = 0; for (let x = m; x; x &= x - 1) n++
      if (n < bn) { bn = n; bi = i; bm = m; if (n <= 1) break }
    }
    if (bi < 0) { count++; if (!first) first = g.slice(); return }
    if (bn === 0) return
    const ds: number[] = []; for (let d = 1; d <= 9; d++) if (bm & (1 << d)) ds.push(d)
    if (rnd) shuffle(ds, rnd)
    const r = Math.floor(bi / 9), c = bi % 9, bx = BOX(bi)
    for (const d of ds) {
      const bit = 1 << d; g[bi] = d; rows[r] |= bit; cols[c] |= bit; boxes[bx] |= bit
      rec()
      g[bi] = 0; rows[r] &= ~bit; cols[c] &= ~bit; boxes[bx] &= ~bit
      if (count >= limit) return
    }
  }
  rec()
  return { count, first }
}
export function generate(clues: number, rnd: () => number = Math.random) {
  const solution = search(Array(81).fill(0), 1, rnd).first as number[], puzzle = solution.slice()
  let left = 81
  for (const i of shuffle([...Array(81).keys()], rnd)) {
    if (left <= clues) break
    const v = puzzle[i]; puzzle[i] = 0
    if (search(puzzle, 2).count === 1) left--; else puzzle[i] = v
  }
  return { puzzle, solution }
}
export function conflicts(b: number[]): boolean[] {
  const out = Array(81).fill(false)
  for (let i = 0; i < 81; i++) if (b[i]) for (let j = 0; j < 81; j++) {
    if (i !== j && b[j] === b[i] && (Math.floor(i / 9) === Math.floor(j / 9) || i % 9 === j % 9 || BOX(i) === BOX(j))) { out[i] = true; break }
  }
  return out
}
