import { useEffect, useRef, useState } from 'react'
import { CELL, COLS, H, MAX_WAVE, PATH_LEN, ROWS, TYPES, W, build, dmgOf, newState, pathCells, posAt, rangeOf, sell, startWave, step, upgrade, upgradeCost, type TType, type Tower } from './logic'
import { Frame, Stat, canvasStyle, local, setupCanvas, useLoop, useTick } from '../shared'

export default function TowerGame() {
  const cv = useRef<HTMLCanvasElement>(null), ctxR = useRef<CanvasRenderingContext2D | null>(null)
  const s = useRef(newState()), acc = useRef(0)
  const [, tick] = useTick()
  const [pick, setPick] = useState<TType | null>('arrow'); const [selT, setSelT] = useState<Tower | null>(null)
  useEffect(() => { ctxR.current = setupCanvas(cv.current as HTMLCanvasElement, W, H) }, [])
  useLoop(dt => {
    const st = s.current; step(st, dt)
    const c = ctxR.current; if (!c) return
    c.fillStyle = '#0d0a1c'; c.fillRect(0, 0, W, H)
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      c.fillStyle = pathCells.has(`${x},${y}`) ? '#2a2145' : (x + y) % 2 ? '#14102a' : '#171330'; c.fillRect(x * CELL, y * CELL, CELL, CELL)
    }
    c.fillStyle = '#8B5CF6'; c.shadowColor = '#8B5CF6'; c.shadowBlur = 18; c.beginPath(); c.moveTo(9.5 * CELL, 5.5 * CELL - 16); c.lineTo(9.5 * CELL + 13, 5.5 * CELL); c.lineTo(9.5 * CELL, 5.5 * CELL + 16); c.lineTo(9.5 * CELL - 13, 5.5 * CELL); c.fill(); c.shadowBlur = 0
    if (selT) { c.strokeStyle = 'rgb(255 255 255 / .35)'; c.beginPath(); c.arc(selT.cx * CELL + CELL / 2, selT.cy * CELL + CELL / 2, rangeOf(selT), 0, 7); c.stroke() }
    for (const t of st.towers) {
      const x = t.cx * CELL + CELL / 2, y = t.cy * CELL + CELL / 2
      c.fillStyle = TYPES[t.type].color; c.beginPath(); c.arc(x, y, CELL * 0.32, 0, 7); c.fill()
      c.fillStyle = '#09090F'; for (let i = 0; i < t.lvl; i++) { c.beginPath(); c.arc(x - (t.lvl - 1) * 5 + i * 10, y, 3, 0, 7); c.fill() }
      if (selT === t) { c.strokeStyle = '#FDE047'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, CELL * 0.4, 0, 7); c.stroke() }
    }
    for (const e of st.enemies) {
      const p = posAt(Math.min(e.d, PATH_LEN)), r = e.boss ? 15 : 10
      c.fillStyle = e.slow > 0 ? '#67E8F9' : e.boss ? '#F43F5E' : '#FB923C'; c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fill()
      c.fillStyle = '#000'; c.fillRect(p.x - 14, p.y - r - 7, 28, 4); c.fillStyle = '#4ADE80'; c.fillRect(p.x - 14, p.y - r - 7, 28 * Math.max(0, e.hp / e.max), 4)
    }
    for (const f of st.fx) { c.globalAlpha = f.t / 0.12; c.strokeStyle = f.color; c.lineWidth = 3; c.beginPath(); c.moveTo(f.x1, f.y1); c.lineTo(f.x2, f.y2); c.stroke(); if (f.r) { c.beginPath(); c.arc(f.x2, f.y2, f.r, 0, 7); c.stroke() } c.globalAlpha = 1 }
    acc.current += dt; if (acc.current > 0.1) { acc.current = 0; tick() }
  })
  const st = s.current
  const onTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = local(e, e.currentTarget, W, H), cx = Math.floor(p.x / CELL), cy = Math.floor(p.y / CELL)
    const t = st.towers.find(x => x.cx === cx && x.cy === cy)
    if (t) { setSelT(t); setPick(null); return }
    setSelT(null); if (pick) build(st, pick, cx, cy); tick()
  }
  const reset = () => { s.current = newState(); setSelT(null); setPick('arrow') }
  return (
    <Frame max={W}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5"><Stat l="Золото" v={st.gold} /><Stat l="Кристалл" v={`${st.lives} ♥`} /><Stat l="Волна" v={`${st.wave}/${MAX_WAVE}`} /></div>
        <div className="flex gap-2">
          <button className="btn-primary" disabled={st.status !== 'build'} onClick={() => { startWave(st); tick() }}>{st.wave ? 'Следующая волна' : 'Начать волну'}</button>
          <button className="btn-ghost" onClick={reset}>Заново</button>
        </div>
      </div>
      <canvas ref={cv} style={canvasStyle(W, H)} onPointerDown={onTap} />
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(TYPES) as TType[]).map(k => (
          <button key={k} onClick={() => { setPick(k); setSelT(null) }} className={`btn flex-1 !px-2 text-sm ${pick === k ? 'bg-primary text-white' : 'bg-white/5 text-muted'}`} disabled={st.gold < TYPES[k].cost && pick !== k}>
            {TYPES[k].name} · {TYPES[k].cost}
          </button>
        ))}
      </div>
      {selT && st.towers.includes(selT) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 p-3 text-sm">
          <span>{TYPES[selT.type].name}, ур. {selT.lvl}/3 · урон {Math.round(dmgOf(selT))}</span>
          <span className="flex gap-2">
            <button className="btn-ghost !min-h-[40px]" disabled={selT.lvl >= 3 || st.gold < upgradeCost(selT)} onClick={() => { upgrade(st, selT); tick() }}>{selT.lvl >= 3 ? 'Макс.' : `Улучшить ${upgradeCost(selT)}`}</button>
            <button className="btn-ghost !min-h-[40px]" onClick={() => { sell(st, selT); setSelT(null) }}>Продать {Math.floor(selT.spent * 0.7)}</button>
          </span>
        </div>
      )}
      {(st.status === 'over' || st.status === 'win') && (
        <div className="mt-3 rounded-xl bg-primary/20 p-4 text-center"><div className="text-2xl font-extrabold">{st.status === 'win' ? 'Кристалл защищён! Победа' : 'Кристалл разрушен'}</div><button className="btn-primary mt-3" onClick={reset}>Играть снова</button></div>
      )}
      <p className="mt-3 text-center text-sm text-muted">Выберите башню и коснитесь свободной клетки. Коснитесь башни, чтобы улучшить или продать.</p>
    </Frame>
  )
}
