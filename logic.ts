export const W = 720, H = 300, GY = H - 50, PX = 90, PW = 28, PHT = 44
export interface Obs { x: number; w: number; h: number }
export interface RState { y: number; vy: number; obs: Obs[]; speed: number; dist: number; next: number; status: 'ready' | 'play' | 'over'; t: number }
export const newState = (): RState => ({ y: 0, vy: 0, obs: [], speed: 320, dist: 0, next: 500, status: 'ready', t: 0 })
export function jump(s: RState) {
  if (s.status === 'ready') s.status = 'play'
  if (s.status === 'play' && s.y === 0) s.vy = 620
}
export const scoreOf = (s: RState) => Math.floor(s.dist / 10)
export function step(s: RState, dt: number, rnd: () => number = Math.random) {
  if (s.status !== 'play') return
  s.t += dt; s.speed = Math.min(720, 320 + s.dist * 0.05); s.dist += s.speed * dt
  s.vy -= 1900 * dt; s.y += s.vy * dt; if (s.y <= 0) { s.y = 0; s.vy = 0 }
  s.obs.forEach(o => { o.x -= s.speed * dt }); s.obs = s.obs.filter(o => o.x + o.w > -10)
  s.next -= s.speed * dt
  if (s.next <= 0) {
    const w = 18 + rnd() * 22, h = 28 + rnd() * 24
    s.obs.push({ x: W + 20, w, h }); s.next = s.speed * 0.78 + w + 60 + rnd() * 260
  }
  for (const o of s.obs) if (PX + 4 < o.x + o.w && PX + PW - 4 > o.x && s.y < o.h - 2) { s.status = 'over'; break }
}
