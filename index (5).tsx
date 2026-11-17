import { useEffect, useState } from 'react'
import { Eraser, Lightbulb, Plus, Undo2 } from 'lucide-react'
import { conflicts, generate } from './logic'
import { Frame, Stat, fmtTime } from '../shared'

const CLUES = { easy: 40, medium: 32, hard: 26 } as const
type Diff = keyof typeof CLUES
const NAMES: Record<Diff, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }
export default function SudokuGame() {
  const [diff, setDiff] = useState<Diff>('easy')
  const [game, setGame] = useState(() => generate(CLUES.easy))
  const [cells, setCells] = useState<number[]>(game.puzzle)
  const [hist, setHist] = useState<number[][]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [secs, setSecs] = useState(0)
  const bad = conflicts(cells)
  const solved = cells.every((v, i) => v === game.solution[i])
  useEffect(() => { if (solved) return; const id = setInterval(() => setSecs(x => x + 1), 1000); return () => clearInterval(id) }, [solved])
  const set = (i: number, v: number) => {
    if (game.puzzle[i] || cells[i] === v) return
    setHist(h => [...h.slice(-200), cells]); setCells(c => c.map((x, k) => (k === i ? v : x)))
  }
  const put = (v: number) => { if (sel !== null && !solved) set(sel, v) }
  const newGame = (d: Diff) => { const g = generate(CLUES[d]); setDiff(d); setGame(g); setCells(g.puzzle); setHist([]); setSel(null); setSecs(0) }
  const undo = () => { if (hist.length) { setCells(hist[hist.length - 1]); setHist(hist.slice(0, -1)) } }
  const hint = () => {
    const i = sel !== null && !game.puzzle[sel] && cells[sel] !== game.solution[sel] ? sel : cells.findIndex((v, k) => v !== game.solution[k])
    if (i >= 0) { setSel(i); set(i, game.solution[i]) }
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) put(+e.key)
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0)
      else if (sel !== null && e.key.startsWith('Arrow')) {
        e.preventDefault(); const r = Math.floor(sel / 9), c = sel % 9
        setSel(e.key === 'ArrowUp' ? Math.max(0, r - 1) * 9 + c : e.key === 'ArrowDown' ? Math.min(8, r + 1) * 9 + c : e.key === 'ArrowLeft' ? r * 9 + Math.max(0, c - 1) : r * 9 + Math.min(8, c + 1))
      }
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })
  const sv = sel !== null ? cells[sel] : 0
  const related = (i: number) => sel !== null && (Math.floor(i / 9) === Math.floor(sel / 9) || i % 9 === sel % 9 || (Math.floor(i / 27) === Math.floor(sel / 27) && Math.floor((i % 9) / 3) === Math.floor((sel % 9) / 3)))
  return (
    <Frame max={460}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5"><Stat l="Время" v={fmtTime(secs)} /><Stat l="Уровень" v={NAMES[diff]} /></div>
        <div className="flex gap-2">{(Object.keys(CLUES) as Diff[]).map(d => <button key={d} onClick={() => newGame(d)} className={`btn !px-3 text-sm ${d === diff ? 'bg-primary text-white' : 'bg-white/5 text-muted'}`}>{NAMES[d]}</button>)}</div>
      </div>
      <div className="relative mx-auto grid aspect-square w-full grid-cols-9 overflow-hidden rounded-xl border-2 border-accent/60 bg-bg/60">
        {cells.map((v, i) => {
          const r = Math.floor(i / 9), c = i % 9, given = !!game.puzzle[i]
          return (
            <button key={i} onClick={() => setSel(i)}
              className={`grid place-items-center text-lg font-bold sm:text-2xl ${given ? 'text-ink' : 'text-accent'} ${bad[i] ? '!text-red-400' : ''}`}
              style={{ borderRight: c % 3 === 2 && c < 8 ? '2px solid rgb(167 139 250 / .6)' : '1px solid rgb(255 255 255 / .07)', borderBottom: r % 3 === 2 && r < 8 ? '2px solid rgb(167 139 250 / .6)' : '1px solid rgb(255 255 255 / .07)',
                background: sel === i ? 'rgb(139 92 246 / .55)' : v && v === sv ? 'rgb(139 92 246 / .3)' : bad[i] ? 'rgb(239 68 68 / .18)' : related(i) ? 'rgb(255 255 255 / .06)' : 'transparent' }}>
              {v || ''}
            </button>
          )
        })}
        {solved && <div className="absolute inset-0 grid place-items-center bg-bg/80 text-center backdrop-blur-sm"><div><div className="text-3xl font-extrabold text-accent">Решено!</div><p className="mt-1 text-muted">Время {fmtTime(secs)}</p><button className="btn-primary mt-4" onClick={() => newGame(diff)}>Новая игра</button></div></div>}
      </div>
      <div className="mt-3 grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <button key={n} onClick={() => put(n)} className="btn-ghost !min-h-[48px] !px-0 text-lg" style={{ opacity: cells.filter(x => x === n).length >= 9 ? 0.3 : 1 }}>{n}</button>)}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button className="btn-ghost" onClick={undo} disabled={!hist.length}><Undo2 size={18} />Отмена</button>
        <button className="btn-ghost" onClick={() => put(0)}><Eraser size={18} />Стереть</button>
        <button className="btn-ghost" onClick={hint}><Lightbulb size={18} />Подсказка</button>
        <button className="btn-ghost" onClick={() => newGame(diff)} aria-label="Новая"><Plus size={18} /></button>
      </div>
    </Frame>
  )
}
