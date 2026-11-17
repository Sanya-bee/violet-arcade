// Чистая логика пасьянсов: без React и DOM. Масти: 0♠ 1♥ 2♦ 3♣.
export type Mode = 'klondike' | 'spider' | 'freecell'
export interface Card { id: number; s: number; r: number; up: boolean }
export type Kind = 't' | 'f' | 'c' | 'w'
export interface Ref { k: Kind; i: number }
export interface Move { from: Ref; n: number; to: Ref }
export interface Opts { suits: 1 | 2 | 4; draw: 1 | 3 }
export interface State {
  mode: Mode; t: Card[][]; f: Card[][]; c: (Card | null)[]
  stock: Card[]; waste: Card[]; score: number; moves: number; won: boolean; draw: number
}
export const isRed = (s: number) => s === 1 || s === 2
export const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
export function shuffle<T>(a: T[], rnd: () => number = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
export function newGame(mode: Mode, o: Opts, rnd: () => number = Math.random): State {
  const st: State = { mode, t: [], f: [], c: [], stock: [], waste: [], score: 0, moves: 0, won: false, draw: o.draw }
  const deck: Card[] = []
  if (mode === 'spider') {
    for (let set = 0; set < 8; set++) for (let r = 1; r <= 13; r++) deck.push({ id: set * 13 + r - 1, s: set % o.suits, r, up: false })
  } else for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({ id: s * 13 + r - 1, s, r, up: false })
  shuffle(deck, rnd)
  const cols = mode === 'klondike' ? 7 : mode === 'spider' ? 10 : 8
  for (let i = 0; i < cols; i++) {
    const n = mode === 'klondike' ? i + 1 : mode === 'spider' ? (i < 4 ? 6 : 5) : (i < 4 ? 7 : 6)
    const p = deck.splice(0, n)
    if (mode === 'freecell') p.forEach(c => (c.up = true)); else p[p.length - 1].up = true
    st.t.push(p)
  }
  st.stock = deck
  if (mode === 'spider') st.score = 500
  if (mode === 'freecell') st.c = [null, null, null, null]
  if (mode !== 'spider') st.f = [[], [], [], []]
  return st
}
export function seqOk(cs: Card[], mode: Mode): boolean {
  for (let i = 0; i + 1 < cs.length; i++) {
    const a = cs[i], b = cs[i + 1]
    if (a.r !== b.r + 1) return false
    if (mode === 'spider' ? a.s !== b.s : isRed(a.s) === isRed(b.s)) return false
  }
  return true
}
export function canPick(st: State, ref: Ref, n: number): boolean {
  if (n < 1) return false
  if (ref.k === 't') {
    const p = st.t[ref.i]; if (!p || p.length < n) return false
    const cs = p.slice(-n); return cs.every(c => c.up) && seqOk(cs, st.mode)
  }
  if (ref.k === 'w') return n === 1 && st.waste.length > 0
  if (ref.k === 'c') return n === 1 && !!st.c[ref.i]
  return st.mode === 'klondike' && n === 1 && st.f[ref.i].length > 0
}
export function cardsOf(st: State, ref: Ref, n: number): Card[] {
  if (ref.k === 't') return st.t[ref.i].slice(-n)
  if (ref.k === 'w') return [st.waste[st.waste.length - 1]]
  if (ref.k === 'c') return [st.c[ref.i] as Card]
  return [st.f[ref.i][st.f[ref.i].length - 1]]
}
const fits = (fp: Card[], c: Card) => fp.length === 0 ? c.r === 1 : fp[fp.length - 1].s === c.s && fp[fp.length - 1].r === c.r - 1
export function maxRun(st: State, destEmpty: boolean): number {
  const free = st.c.filter(x => !x).length, empty = st.t.filter(p => !p.length).length - (destEmpty ? 1 : 0)
  return (free + 1) * Math.pow(2, Math.max(0, empty))
}
export function canMove(st: State, m: Move): boolean {
  const { from, to, n } = m
  if (!canPick(st, from, n) || (from.k === to.k && from.i === to.i)) return false
  const c = cardsOf(st, from, n)[0]
  if (to.k === 'f') return st.mode !== 'spider' && n === 1 && from.k !== 'f' && !!st.f[to.i] && fits(st.f[to.i], c)
  if (to.k === 'c') return st.mode === 'freecell' && n === 1 && from.k !== 'c' && !st.c[to.i]
  if (to.k === 't') {
    const d = st.t[to.i]; if (!d) return false
    if (d.length === 0) { if (st.mode === 'klondike' && c.r !== 13) return false }
    else {
      const top = d[d.length - 1]
      if (!top.up || top.r !== c.r + 1) return false
      if (st.mode !== 'spider' && isRed(top.s) === isRed(c.s)) return false
    }
    return st.mode !== 'freecell' || n <= maxRun(st, d.length === 0)
  }
  return false
}
function sweep(s: State) { // Паук: убираем собранные K..A одной масти
  for (const p of s.t) {
    if (p.length < 13) continue
    const run = p.slice(-13)
    if (run.every((c, k) => c.up && c.r === 13 - k && c.s === run[0].s)) {
      s.f.push(p.splice(-13, 13)); s.score += 100
      if (p.length) p[p.length - 1].up = true
    }
  }
}
const won = (s: State) => s.mode === 'spider' ? s.f.length === 8 : s.f.reduce((a, p) => a + p.length, 0) === 52
export function applyMove(st: State, m: Move): State {
  const s = clone(st), { from, to, n } = m
  let cs: Card[]
  if (from.k === 't') cs = s.t[from.i].splice(-n, n)
  else if (from.k === 'w') cs = [s.waste.pop() as Card]
  else if (from.k === 'c') { cs = [s.c[from.i] as Card]; s.c[from.i] = null }
  else cs = [s.f[from.i].pop() as Card]
  if (to.k === 't') s.t[to.i].push(...cs); else if (to.k === 'f') s.f[to.i].push(cs[0]); else s.c[to.i] = cs[0]
  s.moves++
  if (s.mode === 'klondike') { if (to.k === 'f') s.score += 10; else if (from.k === 'w') s.score += 5; else if (from.k === 'f') s.score -= 15 }
  if (s.mode === 'freecell' && to.k === 'f') s.score += 10
  if (s.mode === 'spider') s.score = Math.max(0, s.score - 1)
  if (from.k === 't') { const p = s.t[from.i], l = p[p.length - 1]; if (l && !l.up) { l.up = true; if (s.mode === 'klondike') s.score += 5 } }
  if (s.mode === 'spider') sweep(s)
  s.score = Math.max(0, s.score); s.won = won(s)
  return s
}
export function drawStock(st: State): State | null {
  const s = clone(st)
  if (s.mode === 'klondike') {
    if (s.stock.length) for (let k = 0; k < s.draw && s.stock.length; k++) { const c = s.stock.pop() as Card; c.up = true; s.waste.push(c) }
    else if (s.waste.length) { while (s.waste.length) { const c = s.waste.pop() as Card; c.up = false; s.stock.push(c) }; s.score = Math.max(0, s.score - (s.draw === 1 ? 100 : 20)) }
    else return null
  } else if (s.mode === 'spider') {
    if (s.stock.length < 10 || s.t.some(p => !p.length)) return null
    for (const p of s.t) { const c = s.stock.pop() as Card; c.up = true; p.push(c) }
    s.score = Math.max(0, s.score - 1); sweep(s)
  } else return null
  s.moves++; s.won = won(s); return s
}
export function legalMoves(st: State): Move[] {
  const src: { ref: Ref; n: number }[] = []
  st.t.forEach((p, i) => { for (let n = 1; n <= p.length; n++) { if (!canPick(st, { k: 't', i }, n)) break; src.push({ ref: { k: 't', i }, n }) } })
  if (st.waste.length) src.push({ ref: { k: 'w', i: 0 }, n: 1 })
  st.c.forEach((c, i) => c && src.push({ ref: { k: 'c', i }, n: 1 }))
  const dst: Ref[] = st.t.map((_, i) => ({ k: 't', i }))
  if (st.mode !== 'spider') st.f.forEach((_, i) => dst.push({ k: 'f', i }))
  st.c.forEach((_, i) => dst.push({ k: 'c', i }))
  const out: Move[] = []
  for (const s of src) for (const to of dst) { const m = { from: s.ref, n: s.n, to }; if (canMove(st, m)) out.push(m) }
  return out
}
export function bestHint(st: State): { move?: Move; stock?: boolean } | null {
  let best: Move | null = null, bs = -1
  for (const m of legalMoves(st)) {
    const cs = cardsOf(st, m.from, m.n), c = cs[0]
    const p = m.from.k === 't' ? st.t[m.from.i] : null, j = p ? p.length - m.n : 0
    const dest = m.to.k === 't' ? st.t[m.to.i] : null
    let sc = m.to.k === 'f' ? 100 : m.to.k === 'c' ? 1 : 20
    if (p && j > 0 && !p[j - 1].up) sc = Math.max(sc, 60)
    else if (p && j > 0 && m.to.k !== 'f' && seqOk([p[j - 1], c], st.mode)) continue
    if (p && j === 0 && dest && !dest.length) continue
    if (m.from.k === 'w') sc += 20
    if (m.from.k === 'c' && m.to.k === 't') sc += 10
    if (dest && dest.length && dest[dest.length - 1].s === c.s) sc += 10
    if (sc > bs) { bs = sc; best = m }
  }
  if (best) return { move: best }
  if (st.mode === 'klondike' && (st.stock.length || st.waste.length)) return { stock: true }
  if (st.mode === 'spider' && st.stock.length >= 10 && st.t.every(p => p.length)) return { stock: true }
  return null
}
export function bestTarget(st: State, ref: Ref, n: number): Move | null {
  if (!canPick(st, ref, n)) return null
  const c = cardsOf(st, ref, n)[0], tries: Ref[] = []
  if (st.mode !== 'spider') st.f.forEach((_, i) => tries.push({ k: 'f', i }))
  const ne = st.t.map((p, i) => ({ p, i })).filter(x => x.p.length)
  if (st.mode === 'spider') ne.sort((a, b) => Number(b.p[b.p.length - 1].s === c.s) - Number(a.p[a.p.length - 1].s === c.s))
  ne.forEach(x => tries.push({ k: 't', i: x.i }))
  st.t.forEach((p, i) => !p.length && tries.push({ k: 't', i }))
  if (st.mode === 'freecell') st.c.forEach((_, i) => tries.push({ k: 'c', i }))
  for (const to of tries) { const m = { from: ref, n, to }; if (canMove(st, m)) return m }
  return null
}
const fCount = (st: State, suit: number) => (st.f.find(p => p.length && p[0].s === suit) || []).length
export function autoStep(st: State, safe: boolean): Move | null {
  if (st.mode === 'spider') return null
  const src: Ref[] = []
  st.t.forEach((p, i) => p.length && src.push({ k: 't', i }))
  if (st.waste.length) src.push({ k: 'w', i: 0 })
  st.c.forEach((c, i) => c && src.push({ k: 'c', i }))
  for (const from of src) {
    const c = cardsOf(st, from, 1)[0]; if (!c.up) continue
    if (safe && c.r > 2 && ![0, 1, 2, 3].filter(s => isRed(s) !== isRed(c.s)).every(s => fCount(st, s) >= c.r - 1)) continue
    const i = st.f.findIndex(p => fits(p, c)); if (i >= 0) return { from, n: 1, to: { k: 'f', i } }
  }
  return null
}
