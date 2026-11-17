export const CELL = 56, COLS = 10, ROWS = 7, W = COLS * CELL, H = ROWS * CELL, MAX_WAVE = 15
export const WAYPOINTS: [number, number][] = [[0, 1], [8, 1], [8, 3], [1, 3], [1, 5], [9, 5]]
const pts = WAYPOINTS.map(([c, r]) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 }))
const segLen = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))
export const PATH_LEN = segLen.reduce((a, b) => a + b, 0)
export const pathCells = new Set<string>()
WAYPOINTS.slice(1).forEach(([c, r], i) => {
  const [c0, r0] = WAYPOINTS[i], n = Math.max(Math.abs(c - c0), Math.abs(r - r0))
  for (let k = 0; k <= n; k++) pathCells.add(`${c0 + Math.sign(c - c0) * k},${r0 + Math.sign(r - r0) * k}`)
})
export function posAt(d: number) {
  let rest = d
  for (let i = 0; i < segLen.length; i++) {
    if (rest <= segLen[i]) { const t = rest / segLen[i]; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t } }
    rest -= segLen[i]
  }
  return pts[pts.length - 1]
}
export type TType = 'arrow' | 'frost' | 'cannon'
export const TYPES: Record<TType, { name: string; cost: number; range: number; dmg: number; cd: number; color: string }> = {
  arrow: { name: 'Лазер', cost: 50, range: 2.4, dmg: 14, cd: 0.45, color: '#A78BFA' },
  frost: { name: 'Мороз', cost: 70, range: 2.1, dmg: 5, cd: 0.7, color: '#67E8F9' },
  cannon: { name: 'Пушка', cost: 110, range: 2.7, dmg: 42, cd: 1.5, color: '#F472B6' },
}
export interface Tower { id: number; cx: number; cy: number; type: TType; lvl: number; cd: number; spent: number }
export interface Enemy { id: number; d: number; hp: number; max: number; slow: number; boss: boolean; speed: number; reward: number }
export interface Fx { x1: number; y1: number; x2: number; y2: number; t: number; color: string; r?: number }
export interface TState { gold: number; lives: number; wave: number; spawnLeft: number; spawnT: number; enemies: Enemy[]; towers: Tower[]; fx: Fx[]; status: 'build' | 'wave' | 'over' | 'win'; nid: number }
export const newState = (): TState => ({ gold: 150, lives: 20, wave: 0, spawnLeft: 0, spawnT: 0, enemies: [], towers: [], fx: [], status: 'build', nid: 1 })
export const upgradeCost = (t: Tower) => Math.floor(TYPES[t.type].cost * 0.8 * t.lvl)
export const rangeOf = (t: Tower) => TYPES[t.type].range * CELL * (1 + 0.08 * (t.lvl - 1))
export const dmgOf = (t: Tower) => TYPES[t.type].dmg * Math.pow(1.6, t.lvl - 1)
export function startWave(s: TState) {
  if (s.status !== 'build') return
  s.wave++; s.spawnLeft = 6 + Math.floor(s.wave * 1.6); s.spawnT = 0; s.status = 'wave'
}
export function build(s: TState, type: TType, cx: number, cy: number) {
  if (s.status === 'over' || s.status === 'win' || cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return false
  if (pathCells.has(`${cx},${cy}`) || s.towers.some(t => t.cx === cx && t.cy === cy) || s.gold < TYPES[type].cost) return false
  s.gold -= TYPES[type].cost; s.towers.push({ id: s.nid++, cx, cy, type, lvl: 1, cd: 0, spent: TYPES[type].cost }); return true
}
export function upgrade(s: TState, t: Tower) {
  const c = upgradeCost(t); if (t.lvl >= 3 || s.gold < c) return false
  s.gold -= c; t.spent += c; t.lvl++; return true
}
export function sell(s: TState, t: Tower) { s.gold += Math.floor(t.spent * 0.7); s.towers = s.towers.filter(x => x !== t) }
export function step(s: TState, dt: number) {
  s.fx.forEach(f => { f.t -= dt }); s.fx = s.fx.filter(f => f.t > 0)
  if (s.status !== 'wave') return
  s.spawnT -= dt
  while (s.spawnLeft > 0 && s.spawnT <= 0) {
    const w = s.wave, boss = w % 5 === 0 && s.spawnLeft === 1, hp = 26 * Math.pow(1.25, w - 1) * (boss ? 8 : 1)
    s.enemies.push({ id: s.nid++, d: 0, hp, max: hp, slow: 0, boss, speed: (46 + w * 2.2) * (boss ? 0.7 : 1), reward: (7 + Math.floor(w / 2)) * (boss ? 8 : 1) })
    s.spawnLeft--; s.spawnT += 0.8
  }
  for (const e of s.enemies) { e.d += e.speed * (e.slow > 0 ? 0.5 : 1) * dt; e.slow -= dt }
  const reached = s.enemies.filter(e => e.d >= PATH_LEN); s.lives -= reached.length
  s.enemies = s.enemies.filter(e => e.d < PATH_LEN)
  if (s.lives <= 0) { s.lives = 0; s.status = 'over'; return }
  for (const t of s.towers) {
    t.cd -= dt; if (t.cd > 0) continue
    const tx = t.cx * CELL + CELL / 2, ty = t.cy * CELL + CELL / 2, R = rangeOf(t)
    let tg: Enemy | null = null
    for (const e of s.enemies) { const p = posAt(e.d); if (Math.hypot(p.x - tx, p.y - ty) <= R && (!tg || e.d > tg.d)) tg = e }
    if (!tg) continue
    const tp = posAt(tg.d), dmg = dmgOf(t); t.cd = TYPES[t.type].cd
    s.fx.push({ x1: tx, y1: ty, x2: tp.x, y2: tp.y, t: 0.12, color: TYPES[t.type].color, r: t.type === 'cannon' ? CELL * 0.9 : undefined })
    if (t.type === 'cannon') { for (const e of s.enemies) { const p = posAt(e.d); if (Math.hypot(p.x - tp.x, p.y - tp.y) <= CELL * 0.9) e.hp -= dmg } }
    else { tg.hp -= dmg; if (t.type === 'frost') tg.slow = 1.5 }
  }
  for (const e of s.enemies) if (e.hp <= 0) s.gold += e.reward
  s.enemies = s.enemies.filter(e => e.hp > 0)
  if (s.spawnLeft === 0 && !s.enemies.length) {
    if (s.wave >= MAX_WAVE) s.status = 'win'; else { s.status = 'build'; s.gold += 20 + s.wave * 3 }
  }
}
