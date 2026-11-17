export const W = 480, H = 640, PY = H - 48, PH = 12
export interface Brick { x: number; y: number; w: number; h: number; hp: number; row: number }
export interface BState { px: number; pw: number; bx: number; by: number; vx: number; vy: number; r: number; bricks: Brick[]; score: number; lives: number; level: number; status: 'ready' | 'play' | 'over' }
export const speedOf = (l: number) => 360 + l * 25
export function makeBricks(level: number): Brick[] {
  const cols = 8, rows = Math.min(8, 3 + level), pad = 16, gap = 4, w = (W - pad * 2 - gap * (cols - 1)) / cols, out: Brick[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: pad + c * (w + gap), y: 70 + r * 26, w, h: 22, hp: level >= 2 && r < Math.floor(level / 2) ? 2 : 1, row: r })
  return out
}
export const newState = (level = 1, score = 0, lives = 3): BState => ({ px: W / 2, pw: 90, bx: W / 2, by: PY - 8, vx: 0, vy: 0, r: 7, bricks: makeBricks(level), score, lives, level, status: 'ready' })
export function launch(s: BState, rnd: () => number = Math.random) {
  if (s.status !== 'ready') return
  s.status = 'play'; const a = -Math.PI / 2 + (rnd() - 0.5) * 0.6, v = speedOf(s.level)
  s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v
}
export const movePaddle = (s: BState, x: number) => { s.px = Math.max(s.pw / 2, Math.min(W - s.pw / 2, x)) }
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export function step(s: BState, dt: number) {
  if (s.status === 'over') return
  if (s.status === 'ready') { s.bx = s.px; s.by = PY - s.r - 1; return }
  const n = Math.max(1, Math.ceil(dt * 120)), h = dt / n
  for (let k = 0; k < n && s.status === 'play'; k++) {
    s.bx += s.vx * h; s.by += s.vy * h
    if (s.bx < s.r) { s.bx = s.r; s.vx = Math.abs(s.vx) }
    if (s.bx > W - s.r) { s.bx = W - s.r; s.vx = -Math.abs(s.vx) }
    if (s.by < s.r) { s.by = s.r; s.vy = Math.abs(s.vy) }
    if (s.vy > 0 && s.by + s.r >= PY && s.by - s.r <= PY + PH && Math.abs(s.bx - s.px) <= s.pw / 2 + s.r) {
      const t = clamp((s.bx - s.px) / (s.pw / 2), -1, 1), sp = Math.hypot(s.vx, s.vy), a = t * (Math.PI / 3)
      s.vx = sp * Math.sin(a); s.vy = -sp * Math.cos(a); s.by = PY - s.r
    }
    for (const b of s.bricks) {
      if (b.hp <= 0) continue
      const dx = s.bx - clamp(s.bx, b.x, b.x + b.w), dy = s.by - clamp(s.by, b.y, b.y + b.h)
      if (dx * dx + dy * dy >= s.r * s.r) continue
      if (dx === 0 && dy === 0) s.vy = -s.vy
      else if (Math.abs(dx) > Math.abs(dy)) s.vx = dx > 0 ? Math.abs(s.vx) : -Math.abs(s.vx)
      else s.vy = dy > 0 ? Math.abs(s.vy) : -Math.abs(s.vy)
      const sp = Math.hypot(s.vx, s.vy); if (Math.abs(s.vy) < sp * 0.2) s.vy = (s.vy < 0 ? -1 : 1) * sp * 0.2
      b.hp--; s.score += b.hp === 0 ? 10 : 5; break
    }
    if (s.bricks.every(b => b.hp <= 0)) { s.level++; s.bricks = makeBricks(s.level); s.status = 'ready'; s.vx = s.vy = 0; s.score += 50; break }
    if (s.by - s.r > H) { s.lives--; s.status = s.lives <= 0 ? 'over' : 'ready'; s.vx = s.vy = 0 }
  }
}
