import { useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Board, { type Saved } from './Board'
import SettingsPanel from './SettingsPanel'
import { useSolSettings } from './settings'
import type { Mode } from './engine'

const TABS: [Mode, string][] = [['klondike', 'Косынка'], ['spider', 'Паук'], ['freecell', 'FreeCell']]
export default function SolitaireGame() {
  const [s, set, ready] = useSolSettings()
  const [mode, setMode] = useState<Mode>('klondike')
  const [open, setOpen] = useState(false)
  const store = useRef(new Map<Mode, Saved>())
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">{TABS.map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} className={`btn whitespace-nowrap ${mode === m ? 'bg-primary text-white' : 'bg-white/5 text-muted'}`}>{l}</button>))}</div>
        <button className="btn-ghost" onClick={() => setOpen(true)} aria-label="Настройки"><SlidersHorizontal size={18} /></button>
      </div>
      {ready && <Board key={mode} mode={mode} s={s} store={store.current} />}
      {open && <SettingsPanel s={s} set={set} onClose={() => setOpen(false)} />}
    </div>
  )
}
