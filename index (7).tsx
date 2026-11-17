import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Undo2 } from 'lucide-react'
import { addTile, canMove, emptyGrid, slide, type Dir, type Grid } from './logic'
import { Frame, Stat, useBest } from '../shared'

const fresh = () => addTile(addTile(emptyGrid()))
export default function TilesGame() {
  const [g, setG] = useState<Grid>(fresh)
  const [score, setScore] = useState(0)
  const [prev, setPrev] = useState<{ g: Grid; s: number } | null>(null)
  const [won, setWon] = useState(false)
  const [best, submit] = useBest('tiles-best')
  const start = useRef<{ x: number; y: number } | null>(null)
  const over = !canMove(g)
  const move = (d: Dir) => {
    const r = slide(g, d); if (!r.moved) return
    const ng = addTile(r.grid), ns = score + r.gained
    setPrev({ g, s: score }); setG(ng); setScore(ns); submit(ns)
    if (ng.some(row => row.includes(2048))) setWon(true)
  }
  useEffect(() => {
    const keys: Record<string, Dir> = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D' }
    const h = (e: KeyboardEvent) => { const d = keys[e.key]; if (d) { e.preventDefault(); move(d) } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })
  const reset = () => { setG(fresh()); setScore(0); setPrev(null); setWon(false) }
  const color = (v: number) => `hsl(${265 + Math.log2(v) * 4} 70% ${24 + Math.min(Math.log2(v), 11) * 4.5}%)`
  return (
    <Frame max={440}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-5"><Stat l="Счёт" v={score} /><Stat l="Рекорд" v={best} /></div>
        <div className="flex gap-2">
          <button className="btn-ghost" disabled={!prev} aria-label="Отмена" onClick={() => { if (prev) { setG(prev.g); setScore(prev.s); setPrev(null) } }}><Undo2 size={18} /></button>
          <button className="btn-primary" onClick={reset}><RotateCcw size={18} />Заново</button>
        </div>
      </div>
      <div className="relative select-none rounded-2xl bg-bg/60 p-2" style={{ touchAction: 'none' }}
        onPointerDown={e => { start.current = { x: e.clientX, y: e.clientY } }}
        onPointerUp={e => {
          const s0 = start.current; start.current = null; if (!s0) return
          const dx = e.clientX - s0.x, dy = e.clientY - s0.y
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'))
        }}>
        <div className="grid grid-cols-4 gap-2">
          {g.flat().map((v, i) => (
            <div key={i} className="grid aspect-square place-items-center rounded-xl font-extrabold" style={{ background: v ? color(v) : 'rgb(255 255 255 / .05)', fontSize: v > 1023 ? '1.3rem' : v > 99 ? '1.7rem' : '2.1rem' }}>{v || ''}</div>
          ))}
        </div>
        {(over || (won && !over)) && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-bg/80 text-center backdrop-blur-sm">
            <div><div className="text-3xl font-extrabold text-accent">{over ? 'Ходов нет' : '2048! Победа'}</div>
              <div className="mt-4 flex justify-center gap-2">{!over && <button className="btn-ghost" onClick={() => setWon(false)}>Продолжить</button>}<button className="btn-primary" onClick={reset}>Новая игра</button></div></div>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-muted">Свайп или стрелки (WASD). Одинаковые плитки сливаются.</p>
    </Frame>
  )
}
