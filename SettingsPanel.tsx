import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { BACKS } from './CardView'
import { TABLES, type SolSettings } from './settings'

function Seg<T extends string | number | boolean>({ v, opts, on }: { v: T; opts: [T, string][]; on: (v: T) => void }) {
  return <div className="flex flex-wrap gap-2">{opts.map(([o, l]) => (
    <button key={String(o)} onClick={() => on(o)} className={`min-h-[44px] rounded-xl px-4 text-sm font-semibold ${v === o ? 'bg-primary text-white' : 'bg-white/5 text-muted'}`}>{l}</button>))}</div>
}
const Row = ({ t, children }: { t: string; children: ReactNode }) => <div className="py-3"><div className="mb-2 text-sm font-bold">{t}</div>{children}</div>

export default function SettingsPanel({ s, set, onClose }: { s: SolSettings; set: (p: Partial<SolSettings>) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div className="card max-h-[88vh] w-full max-w-lg overflow-y-auto p-5 md:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Настройки пасьянса</h2>
          <button className="btn-ghost !px-3" onClick={onClose} aria-label="Закрыть"><X size={20} /></button></div>
        <div className="divide-y divide-white/5">
          <Row t="Размер карт"><Seg v={s.size} on={size => set({ size })} opts={[['s', 'Маленькие'], ['m', 'Средние'], ['l', 'Большие']]} /></Row>
          <Row t="Лицевая сторона"><Seg v={s.face} on={face => set({ face })} opts={[['classic', 'Классика'], ['minimal', 'Минимализм']]} /></Row>
          <Row t="Рубашка">
            <div className="grid grid-cols-4 gap-3">{BACKS.map((b, i) => (
              <button key={b.name} onClick={() => set({ back: i })} aria-label={b.name} className="h-[68px] rounded-lg border-2 border-white"
                style={{ background: b.css, outline: s.back === i ? '3px solid #FDE047' : 'none', outlineOffset: 2 }} />))}</div>
          </Row>
          <Row t="Цвет стола"><div className="flex gap-3">{TABLES.map((t, i) => (
            <button key={t.name} onClick={() => set({ table: i })} aria-label={t.name} className="h-11 w-11 rounded-full border border-white/20"
              style={{ background: t.c, outline: s.table === i ? '3px solid #A78BFA' : 'none', outlineOffset: 2 }} />))}</div></Row>
          <Row t="Скорость анимации"><Seg v={s.speed} on={speed => set({ speed })} opts={[[0, 'Выкл'], [400, 'Медленно'], [200, 'Обычно'], [100, 'Быстро']]} /></Row>
          <Row t="Звук"><Seg v={s.sound} on={sound => set({ sound })} opts={[[true, 'Вкл'], [false, 'Выкл']]} />
            <input type="range" min={0} max={1} step={0.05} value={s.volume} onChange={e => set({ volume: +e.target.value })} className="mt-3 h-8 w-full accent-[#8B5CF6]" aria-label="Громкость" /></Row>
          <Row t="Автоперенос безопасных карт на основание"><Seg v={s.safeAuto} on={safeAuto => set({ safeAuto })} opts={[[true, 'Вкл'], [false, 'Выкл']]} /></Row>
          <Row t="Паук: количество мастей (со следующей партии)"><Seg v={s.suits} on={suits => set({ suits })} opts={[[1, '1'], [2, '2'], [4, '4']]} /></Row>
          <Row t="Косынка: сколько карт открывать (со следующей партии)"><Seg v={s.draw} on={draw => set({ draw })} opts={[[1, '1 карта'], [3, '3 карты']]} /></Row>
        </div>
      </div>
    </div>
  )
}
