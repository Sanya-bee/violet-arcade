import { useEffect, useRef } from 'react'
import { GY, H, PHT, PW, PX, W, jump, newState, scoreOf, step } from './logic'
import { Frame, Stat, canvasStyle, setupCanvas, useBest, useLoop, useTick } from '../shared'

export default function RunnerGame() {
  const cv = useRef<HTMLCanvasElement>(null), ctxR = useRef<CanvasRenderingContext2D | null>(null)
  const s = useRef(newState()), acc = useRef(0), diedAt = useRef(0)
  const [, tick] = useTick(); const [best, submit] = useBest('runner-best')
  useEffect(() => { ctxR.current = setupCanvas(cv.current as HTMLCanvasElement, W, H) }, [])
  const act = () => {
    if (s.current.status === 'over') { if (performance.now() - diedAt.current > 500) s.current = newState() }
    else jump(s.current)
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); act() } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  useLoop(dt => {
    const st = s.current, was = st.status
    step(st, dt); if (was === 'play' && st.status === 'over') { diedAt.current = performance.now(); submit(scoreOf(st)) }
    const c = ctxR.current; if (!c) return
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#0d0a1c'); c.fillStyle = g; c.fillRect(0, 0, W, H)
    c.strokeStyle = 'rgb(139 92 246 / .18)'; c.lineWidth = 1
    const off = st.dist % 48; for (let x = -off; x < W; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, GY); c.stroke() }
    for (let y = 30; y < GY; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
    c.shadowColor = '#8B5CF6'; c.shadowBlur = 14; c.strokeStyle = '#A78BFA'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, GY); c.lineTo(W, GY); c.stroke()
    c.fillStyle = '#F472B6'; for (const o of st.obs) { c.beginPath(); c.roundRect(o.x, GY - o.h, o.w, o.h, 4); c.fill() }
    c.fillStyle = st.status === 'over' ? '#EF4444' : '#C4B5FD'; c.beginPath(); c.roundRect(PX, GY - st.y - PHT, PW, PHT, 6); c.fill(); c.shadowBlur = 0
    c.fillStyle = '#F5F3FF'; c.textAlign = 'center'; c.font = '700 20px sans-serif'
    if (st.status === 'ready') c.fillText('Нажмите, тапните или пробел: прыжок', W / 2, 90)
    if (st.status === 'over') { c.fillStyle = 'rgb(9 9 15 / .7)'; c.fillRect(0, 0, W, H); c.fillStyle = '#A78BFA'; c.font = '800 36px sans-serif'; c.fillText('Врезались!', W / 2, 120); c.fillStyle = '#F5F3FF'; c.font = '600 18px sans-serif'; c.fillText('Нажмите, чтобы бежать снова', W / 2, 160) }
    acc.current += dt; if (acc.current > 0.1) { acc.current = 0; tick() }
  })
  return (
    <Frame max={W}>
      <div className="mb-3 flex gap-6"><Stat l="Очки" v={scoreOf(s.current)} /><Stat l="Рекорд" v={best} /></div>
      <canvas ref={cv} style={canvasStyle(W, H)} onPointerDown={act} />
    </Frame>
  )
}
