import { useEffect, useState } from 'react'
import { dbGet, dbSet } from '../../services/db'
export interface SolSettings {
  size: 's' | 'm' | 'l'; back: number; face: 'classic' | 'minimal'; table: number
  speed: number; sound: boolean; volume: number; suits: 1 | 2 | 4; draw: 1 | 3; safeAuto: boolean
}
export const DEFAULTS: SolSettings = { size: 'm', back: 0, face: 'classic', table: 0, speed: 200, sound: true, volume: 0.6, suits: 2, draw: 1, safeAuto: false }
export const TABLES = [
  { name: 'Фиолет', c: '#1a1030' }, { name: 'Изумруд', c: '#0f2a22' }, { name: 'Океан', c: '#0f1d3a' },
  { name: 'Бордо', c: '#2a1018' }, { name: 'Графит', c: '#17171c' },
]
export function useSolSettings() {
  const [s, setS] = useState<SolSettings>(DEFAULTS)
  const [ready, setReady] = useState(false)
  useEffect(() => { dbGet('solitaire-settings', DEFAULTS).then(v => { setS({ ...DEFAULTS, ...v }); setReady(true) }) }, [])
  useEffect(() => { if (ready) dbSet('solitaire-settings', s) }, [s, ready])
  return [s, (p: Partial<SolSettings>) => setS(x => ({ ...x, ...p })), ready] as const
}
