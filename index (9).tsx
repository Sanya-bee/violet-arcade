import { useEffect, useRef } from 'react'
import { H, PH, PY, W, launch, movePaddle, newState, step } from './logic'
import { Frame, Stat, canvasStyle, local, setupCanvas, useBest, useLoop, useTick } from '../shared'

export default function BricksGame() {
  const cv = useRef<HTMLCanvasElement>(null), ctxR = useRef<CanvasRenderingContext2D | null>(null)
  const s = useRef(newState()), keys = useRef({ l: false, r: false }), acc = useRef(0)
  const [, tick] = useTick(); const [best, submit] = useBest('bricks-best')
  useEffect(() => { ctxR.current = setupCanvas(cv.current as HTMLCanvasElement, W, H) }, [])
  useEffect(() => {
    const dn = (e: KeyboardEvent, v: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.l = v
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.r = v
      if (v && (e.key === ' ' || e.key === 'ArrowUp')) { e.preventDefault(); act() }
    }
    const a = (e: KeyboardEvent) => dn(e, true), b = (e: KeyboardEvent) => dn(e, false)
    window.addEventListener('keydown', a); window.addEventListener('keyup', b)
    return () => { window.removeEventListener('keydown', a); window.removeEventListener('keyup', b) }
  }, [])
  const act = () => { if (s.current.status === 'over') s.current = newState(); else launch(s.current) }
  useLoop(dt => {
    const st = s.current, k = keys.current
    if (k.l || k.r) movePaddle(st, st.px + ((k.r ? 1 : 0) - (k.l ? 1 : 0)) * 520 * dt)
    step(st, dt); submit(st.score)
    const c = ctxR.current; if (!c) return
    c.clearRect(0, 0, W, H)
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#171326'); g.addColorStop(1, '#09090F'); c.fillStyle = g; c.fillRect(0, 0, W, H)
    for (const b of st.bricks) if (b.hp > 0) {
      c.fillStyle = `hsl(${255 + b.row * 12} 80% ${b.hp > 1 ? 68 : 55}%)`; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 5); c.fill()
      if (b.hp > 1) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke() }
    }
    c.fillStyle = '#A78BFA'; c.shadowColor = '#8B5CF6'; c.shadowBlur = 14; c.beginPath(); c.roundRect(st.px - st.pw / 2, PY, st.pw, PH, 6); c.fill()
    c.fillStyle = '#fff'; c.beginPath(); c.arc(st.bx, st.by, st.r, 0, 7); c.fill(); c.shadowBlur = 0
    c.fillStyle = '#F5F3FF'; c.textAlign = 'center'; c.font = '700 20px sans-serif'
    if (st.status === 'ready') c.fillText('Нажмите или пробел, чтобы запустить', W / 2, H / 2 + 90)
    if (st.status === 'over') { c.fillStyle = 'rgb(9 9 15 / .75)'; c.fillRect(0, 0, W, H); c.fillStyle = '#A78BFA'; c.font = '800 38px sans-serif'; c.fillText('Игра окончена', W / 2, H / 2 - 10); c.fillStyle = '#F5F3FF'; c.font = '600 18px sans-serif'; c.fillText(`Счёт ${st.score} · нажмите, чтобы играть снова`, W / 2, H / 2 + 28) }
    acc.current += dt; if (acc.current > 0.12) { acc.current = 0; tick() }
  })
  const st = s.current
  return (
    <Frame max={W}>
      <div className="mb-3 flex gap-6"><Stat l="Счёт" v={st.score} /><Stat l="Уровень" v={st.level} /><Stat l="Жизни" v={'♥'.repeat(st.lives)} /><Stat l="Рекорд" v={best} /></div>
      <canvas ref={cv} style={canvasStyle(W, H)}
        onPointerDown={e => { const p = local(e, e.currentTarget, W, H); movePaddle(s.current, p.x); act() }}
        onPointerMove={e => { if (e.pointerType !== 'mouse' || e.buttons || true) movePaddle(s.current, local(e, e.currentTarget, W, H).x) }} />
      <p className="mt-3 text-center text-sm text-muted">Двигайте пальцем или мышью, либо стрелки; пробел или касание запускает шар.</p>
    </Frame>
  )
}
