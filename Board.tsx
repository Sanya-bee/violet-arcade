import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPE, type ReactNode } from 'react'
import { Lightbulb, Plus, RotateCcw, Undo2, Zap } from 'lucide-react'
import { applyMove, autoStep, bestHint, bestTarget, canMove, canPick, cardsOf, drawStock, newGame } from './engine'
import type { Card, Kind, Mode, Move, Ref, State } from './engine'
import CardView from './CardView'
import { TABLES, type SolSettings } from './settings'
import { playSound } from './sound'

export interface Saved { st: State; hist: State[]; init: State; secs: number }
const fmt = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
const same = (a: Ref, b: Ref) => a.k === b.k && a.i === b.i
const BASE = { s: 54, m: 72, l: 92 }
const FAKE: Card = { id: -1, s: 0, r: 1, up: false }

export default function Board({ mode, s, store }: { mode: Mode; s: SolSettings; store: Map<Mode, Saved> }) {
  const saved = store.get(mode)
  const [st, setSt] = useState<State>(() => saved?.st ?? newGame(mode, { suits: s.suits, draw: s.draw }))
  const [hist, setHist] = useState<State[]>(saved?.hist ?? [])
  const init = useRef<State>(saved?.init ?? st)
  const [secs, setSecs] = useState(saved?.secs ?? 0)
  const [sel, setSel] = useState<{ ref: Ref; n: number } | null>(null)
  const [hint, setHint] = useState<Move | 'stock' | null>(null)
  const [drag, setDrag] = useState<{ x: number; y: number; ox: number; oy: number; ref: Ref; n: number } | null>(null)
  const [auto, setAuto] = useState(false)
  const [msg, setMsg] = useState('')
  const noAuto = useRef(false)
  const wrap = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(360)
  const live = useRef({ st, sel, hist, secs }); live.current = { st, sel, hist, secs }
  const sound = (k: 'move' | 'draw' | 'error' | 'win') => playSound(k, s.sound, s.volume)

  useEffect(() => () => { store.set(mode, { st: live.current.st, hist: live.current.hist, init: init.current, secs: live.current.secs }) }, [])
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const started = st.moves > 0
  useEffect(() => { if (!started || st.won) return; const id = setInterval(() => setSecs(x => x + 1), 1000); return () => clearInterval(id) }, [started, st.won])
  useEffect(() => { if (!hint) return; const t = setTimeout(() => setHint(null), 2200); return () => clearTimeout(t) }, [hint])
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 2600); return () => clearTimeout(t) }, [msg])

  // Автоперенос на основание: «безопасный» после каждого хода (настройка) и полный по кнопке «Авто»
  useEffect(() => {
    if (st.won || mode === 'spider' || drag) return
    if (!auto && !(s.safeAuto && !noAuto.current)) return
    const m = autoStep(st, !auto)
    if (!m) { if (auto) setAuto(false); return }
    const t = setTimeout(() => {
      const nx = applyMove(st, m); setHist(h => [...h.slice(-299), st]); setSt(nx); sound(nx.won ? 'win' : 'move')
    }, auto ? Math.max(40, s.speed / 2) : Math.max(60, s.speed))
    return () => clearTimeout(t)
  }, [st, auto, s.safeAuto, drag])

  const commit = (next: State, snd: 'move' | 'draw' = 'move') => {
    setHist(h => [...h.slice(-299), live.current.st]); setSt(next); setSel(null); setHint(null); noAuto.current = false
    sound(next.won ? 'win' : snd)
  }
  const tryMove = (m: Move, silent = false) => {
    const cur = live.current.st
    if (canMove(cur, m)) { commit(applyMove(cur, m)); return true }
    if (!silent) sound('error'); return false
  }
  const autoMove = (ref: Ref, n: number) => {
    const m = bestTarget(live.current.st, ref, n)
    if (m) commit(applyMove(live.current.st, m)); else { setSel(null); sound('error') }
  }
  const tap = (ref: Ref, n: number) => {
    const sl = live.current.sel
    if (sl) {
      if (same(sl.ref, ref) && sl.n === n) return autoMove(ref, n)
      if (tryMove({ from: sl.ref, n: sl.n, to: ref }, true)) return
    }
    setSel(canPick(live.current.st, ref, n) ? { ref, n } : null)
  }
  const stockTap = () => {
    const cur = live.current.st, nx = drawStock(cur)
    if (nx) commit(nx, 'draw')
    else { sound('error'); if (cur.mode === 'spider' && cur.stock.length) setMsg('Сначала заполните все пустые колонки') }
  }
  const onDown = (e: RPE, ref: Ref, n: number) => {
    e.stopPropagation(); e.preventDefault()
    if (e.button > 0) return
    if (!canPick(live.current.st, ref, n)) { tap(ref, n); return }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const d = { sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, started: false }
    const mv = (ev: PointerEvent) => {
      if (!d.started && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) > 6) { d.started = true; setSel(null); setHint(null) }
      if (d.started) setDrag({ x: ev.clientX, y: ev.clientY, ox: d.ox, oy: d.oy, ref, n })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
      if (!d.started) { if (ev.type === 'pointerup') tap(ref, n); return }
      setDrag(null)
      if (ev.type === 'pointercancel') return
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-pile]') as HTMLElement | null
      if (!el) return
      const [k, i] = (el.dataset.pile as string).split(':')
      tryMove({ from: ref, n, to: { k: k as Kind, i: +i } }, k === ref.k && +i === ref.i)
    }
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
  }
  const fresh = () => {
    const n = newGame(mode, { suits: s.suits, draw: s.draw }); init.current = n
    setSt(n); setHist([]); setSecs(0); setSel(null); setHint(null); setAuto(false)
  }
  const restart = () => { setSt(init.current); setHist([]); setSecs(0); setSel(null); setHint(null); setAuto(false) }
  const undo = () => {
    const h = live.current.hist; if (!h.length) return
    setSt(h[h.length - 1]); setHist(h.slice(0, -1)); setSel(null); setHint(null); setAuto(false); noAuto.current = true; sound('draw')
  }
  const showHint = () => {
    const h = bestHint(live.current.st)
    if (!h) { setMsg('Ходов больше нет: отмените ход или начните заново'); return }
    setHint(h.move ?? 'stock'); setSel(null)
  }

  // ---- геометрия ----
  const cols = mode === 'klondike' ? 7 : mode === 'spider' ? 10 : 8
  const gap = Math.max(4, Math.round(W * 0.012))
  const cw = Math.floor(Math.min(BASE[s.size], (W - gap * (cols - 1)) / cols)), ch = Math.round(cw * 1.42)
  const X = (c: number) => c * (cw + gap)
  const dd = ch * 0.14, du = ch * (mode === 'spider' ? 0.24 : 0.3)
  const ys = (p: Card[]) => { const o: number[] = []; let y = 0; p.forEach(c => { o.push(y); y += c.up ? du : dd }); return o }
  const tabTop = ch + gap * 2.5
  const tabH = Math.max(ch, ...st.t.map(p => (p.length ? ys(p)[p.length - 1] + ch : ch))) + gap
  const hm = hint && hint !== 'stock' ? hint : null
  const flag = (ref: Ref, idx: number, len: number) => ({
    selected: !!sel && same(sel.ref, ref) && idx >= len - sel.n,
    hint: !!hm && same(hm.from, ref) && idx >= len - hm.n,
    hidden: !!drag && same(drag.ref, ref) && idx >= len - drag.n,
  })
  const green = (ref: Ref) => (hm && same(hm.to, ref) ? '#34D399' : undefined)
  const cv = (c: Card, ref: Ref, idx: number, len: number, y = -2, x = -2, pick = true) => (
    <CardView key={c.id} card={c} w={cw} x={x} y={y} back={s.back} face={s.face} {...flag(ref, idx, len)} onDown={pick ? (e => onDown(e, ref, len - idx)) : undefined} />
  )
  const slot = (key: string, col: number, ref: Ref | null, kids: ReactNode, onPD?: () => void, ring?: string) => (
    <div key={key} className="sol-slot" data-pile={ref ? `${ref.k}:${ref.i}` : undefined}
      onPointerDown={e => { if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bg) { if (onPD) onPD(); else if (ref) tap(ref, 0) } }}
      style={{ left: X(col), top: 0, width: cw, height: ch, borderColor: ring }}>{kids}</div>
  )
  const stockSlot = slot('stock', 0, null, <>
    {st.stock.length > 0 && <CardView card={FAKE} w={cw} x={-2} y={-2} back={s.back} face={s.face} hint={hint === 'stock'} />}
    {!st.stock.length && mode === 'klondike' && <div data-bg="1" style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: cw * 0.4, opacity: 0.5 }}>↻</div>}
    {mode === 'spider' && <div className="pointer-events-none absolute -bottom-6 left-0 w-full text-center text-xs text-muted">{Math.floor(st.stock.length / 10)} раздач</div>}
  </>, stockTap, hint === 'stock' ? '#34D399' : undefined)

  const top: ReactNode[] = [stockSlot]
  if (mode === 'klondike') {
    const w = st.waste, from = Math.max(0, w.length - (st.draw === 3 ? 3 : 1)), ref = { k: 'w', i: 0 } as Ref
    top.push(slot('waste', 1, null, w.slice(from).map((c, k) => cv(c, ref, from + k, w.length, -2, -2 + k * cw * 0.22, from + k === w.length - 1))))
  }
  if (mode === 'freecell') { top.length = 0; st.c.forEach((c, i) => { const ref = { k: 'c', i } as Ref; top.push(slot('c' + i, i, ref, c && cv(c, ref, 0, 1), undefined, green(ref))) }) }
  if (mode === 'spider') st.f.forEach((p, i) => top.push(slot('sf' + i, 2 + i, null, <CardView key={p[p.length - 1].id} card={p[p.length - 1]} w={cw} x={-2} y={-2} back={s.back} face={s.face} />)))
  else st.f.forEach((p, i) => { const ref = { k: 'f', i } as Ref, col = (mode === 'klondike' ? 3 : 4) + i; top.push(slot('f' + i, col, ref, p.length ? cv(p[p.length - 1], ref, 0, 1, -2, -2, mode === 'klondike') : <div data-bg="1" style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: cw * 0.35, opacity: 0.25 }}>A</div>, undefined, green(ref))) })

  return (
    <div className="relative rounded-3xl border border-white/10 p-3 md:p-5" style={{ background: `radial-gradient(80% 60% at 50% 0%, rgb(255 255 255 / .07), transparent), ${TABLES[s.table].c}`, ['--anim' as string]: `${s.speed}ms` }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5 text-sm">
          {([['Счёт', st.score], ['Ходы', st.moves], ['Время', fmt(secs)]] as const).map(([l, v]) => <div key={l}><div className="text-xs uppercase tracking-wider text-muted">{l}</div><div className="text-lg font-extrabold tabular-nums">{v}</div></div>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={undo} disabled={!hist.length} aria-label="Отмена хода"><Undo2 size={18} /></button>
          <button className="btn-ghost" onClick={showHint} aria-label="Подсказка"><Lightbulb size={18} /></button>
          {mode !== 'spider' && <button className="btn-ghost" onClick={() => setAuto(true)} aria-label="Авто на основание"><Zap size={18} /></button>}
          <button className="btn-ghost" onClick={restart} aria-label="Перезапуск"><RotateCcw size={18} /></button>
          <button className="btn-primary" onClick={fresh}><Plus size={18} />Новая</button>
        </div>
      </div>
      {msg && <div className="mb-3 rounded-xl bg-white/10 px-4 py-2 text-sm">{msg}</div>}
      <div ref={wrap} className="sol-board relative" style={{ height: tabTop + tabH }} onContextMenu={e => e.preventDefault()}>
        {top}
        {st.t.map((p, i) => {
          const ref = { k: 't', i } as Ref, y = ys(p)
          return (
            <div key={i} data-pile={`t:${i}`} style={{ position: 'absolute', left: X(i), top: tabTop, width: cw, height: tabH }}
              onPointerDown={e => { if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bg) tap(ref, 0) }}>
              <div className="sol-slot" data-bg="1" style={{ left: 0, top: 0, width: cw, height: ch, borderColor: green(ref) }} />
              {p.map((c, k) => cv(c, ref, k, p.length, y[k], 0))}
            </div>
          )
        })}
      </div>
      {drag && (
        <div style={{ position: 'fixed', left: drag.x - drag.ox, top: drag.y - drag.oy, width: cw, zIndex: 60, pointerEvents: 'none' }}>
          {cardsOf(st, drag.ref, drag.n).map((c, k) => <CardView key={c.id} ghost card={c} w={cw} y={k * du} back={s.back} face={s.face} />)}
        </div>
      )}
      {st.won && (
        <div className="absolute inset-0 z-40 grid place-items-center rounded-3xl bg-bg/80 backdrop-blur-sm">
          <div className="card p-8 text-center shadow-[0_0_60px_rgb(var(--primary)/.5)]">
            <div className="text-4xl font-extrabold text-accent">Победа!</div>
            <p className="mt-2 text-muted">Счёт {st.score} · ходов {st.moves} · время {fmt(secs)}</p>
            <button className="btn-primary mt-5" onClick={fresh}>Новая партия</button>
          </div>
        </div>
      )}
    </div>
  )
}
