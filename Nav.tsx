import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Layers, Heart, Clock, Settings, Sparkles } from 'lucide-react'
import Logo from './Logo'

const items = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/catalog', label: 'Каталог', icon: LayoutGrid },
  { to: '/categories', label: 'Категории', icon: Layers },
  { to: '/favorites', label: 'Избранное', icon: Heart },
  { to: '/recent', label: 'Недавние', icon: Clock },
  { to: '/assistant', label: 'AI', icon: Sparkles },
  { to: '/settings', label: 'Настройки', icon: Settings },
]
const mobile = ['/', '/catalog', '/favorites', '/assistant', '/settings']

export function TopNav() {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-white/5 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {items.map(({ to, label, icon: I }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${isActive ? 'bg-primary/20 text-accent' : 'text-muted hover:text-ink'}`}>
              <I size={16} />{label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-surface/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.filter(i => mobile.includes(i.to)).map(({ to, label, icon: I }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-muted'}`}>
            <I size={21} />{label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
