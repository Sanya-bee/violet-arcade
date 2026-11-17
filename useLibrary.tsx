import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dbGet, dbSet } from '../services/db'
import type { Settings } from '../types'

interface Ctx {
  favorites: string[]; recent: string[]; settings: Settings
  toggleFavorite: (id: string) => void; markPlayed: (id: string) => void
  updateSettings: (p: Partial<Settings>) => void
}
const L = createContext<Ctx>(null!)
export const useLibrary = () => useContext(L)

const defaults: Settings = { effects: true, theme: 'dark' }

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFav] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>(defaults)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([dbGet('favorites', [] as string[]), dbGet('recent', [] as string[]), dbGet('settings', defaults)])
      .then(([f, r, s]) => { setFav(f); setRecent(r); setSettings({ ...defaults, ...s }); setReady(true) })
  }, [])
  useEffect(() => { if (ready) { dbSet('favorites', favorites); dbSet('recent', recent); dbSet('settings', settings) } }, [ready, favorites, recent, settings])
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.effects = settings.effects ? 'on' : 'off'
  }, [settings])

  const value: Ctx = {
    favorites, recent, settings,
    toggleFavorite: id => setFav(f => f.includes(id) ? f.filter(x => x !== id) : [id, ...f]),
    markPlayed: id => setRecent(r => [id, ...r.filter(x => x !== id)].slice(0, 12)),
    updateSettings: p => setSettings(s => ({ ...s, ...p })),
  }
  return <L.Provider value={value}>{children}</L.Provider>
}
