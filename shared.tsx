import { useEffect, useRef, useState, type ReactNode } from 'react'
import { dbGet, dbSet } from '../services/db'

export function useBest(key: string) {
  const [best, setBest] = useState(0)
  useEffect(() => { dbGet(key, 0).then(setBest) }, [key])
  const submit = (v: number) => { if (v > best) { setBest(v); dbSet(key, v) } }
  return [best, submit] as const
}
// Цикл анимации: dt ограничен, на скрытой вкладке игра стоит.
export function useLoop(fn: (dt: number) => void) {
  const f = useRef(fn); f.current = fn
  useEffect(() => {
    let last = performance.now(), id = 0
    const tick = (t: number) => { const dt = Math.min(0.05, (t - last) / 1000); last = t; if (!document.hidden) f.current(dt); id = requestAnimationFrame(tick) }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])
}
export function useTick(): [number, () => void] { const [n, set] = useState(0); return [n, () => set(x => x + 1)] }
export function setupCanvas(c: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = w * dpr; c.height = h * dpr
  const ctx = c.getContext('2d') as CanvasRenderingContext2D; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return ctx
}
export function local(e: { clientX: number; clientY: number }, c: HTMLCanvasElement, w: number, h: number) {
  const r = c.getBoundingClientRect(); return { x: ((e.clientX - r.left) * w) / r.width, y: ((e.clientY - r.top) * h) / r.height }
}
export const canvasStyle = (w: number, h: number) => ({ width: '100%', maxWidth: w, aspectRatio: `${w} / ${h}`, touchAction: 'none' as const, display: 'block', margin: '0 auto', borderRadius: 16, background: '#0d0a1c', userSelect: 'none' as const, WebkitUserSelect: 'none' as const })
export const Stat = ({ l, v }: { l: string; v: string | number }) => <div><div className="text-xs uppercase tracking-wider text-muted">{l}</div><div className="text-lg font-extrabold tabular-nums">{v}</div></div>
export const Frame = ({ max, children }: { max: number; children: ReactNode }) => <div className="card mx-auto w-full p-3 md:p-5" style={{ maxWidth: max + 40 }}>{children}</div>
export const fmtTime = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`

// roundRect отсутствует в Safari старше 16: подставляем простой вариант
type RR = { roundRect?: unknown; rect: (x: number, y: number, w: number, h: number) => void }
const proto = (typeof CanvasRenderingContext2D !== 'undefined' ? CanvasRenderingContext2D.prototype : null) as unknown as RR | null
if (proto && !proto.roundRect) proto.roundRect = function (this: RR, x: number, y: number, w: number, h: number) { this.rect(x, y, w, h) }
