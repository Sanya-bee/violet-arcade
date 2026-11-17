import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Play, Heart, Sparkles, Send } from 'lucide-react'
import { categories, games, getGame } from '../games/registry'
import { useLibrary } from '../hooks/useLibrary'
import GameGrid, { Title } from '../components/GameGrid'
import { players } from '../games'

export function HomePage() {
  const { recent } = useLibrary()
  const last = recent.map(getGame).filter(Boolean).slice(0, 3) as typeof games
  return (
    <div className="page">
      <section className="card relative overflow-hidden p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))' }}>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <p className="relative text-sm font-bold uppercase tracking-[.2em] text-accent">Premium gaming dashboard</p>
        <h1 className="relative mt-3 max-w-xl text-4xl font-extrabold leading-tight md:text-5xl">Добро пожаловать в Violet Arcade</h1>
        <p className="relative mt-4 max-w-lg text-muted">Коллекция игр в одном месте: выбирай, сохраняй любимые и продолжай с того места, где остановился.</p>
        <Link to="/catalog" className="btn-primary relative mt-6"><Play size={18} />Открыть каталог</Link>
      </section>
      <h2 className="mb-4 mt-10 text-xl font-bold">Рекомендуем</h2>
      <GameGrid list={games.slice(0, 3)} empty="" />
      {last.length > 0 && <><h2 className="mb-4 mt-10 text-xl font-bold">Продолжить</h2><GameGrid list={last} empty="" /></>}
    </div>
  )
}
export const CatalogPage = () => (
  <div className="page"><Title sub={`Игр в каталоге: ${games.length}`}>Каталог</Title><GameGrid list={games} empty="Пока пусто" /></div>
)
export const CategoriesPage = () => (
  <div className="page"><Title>Категории</Title>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(c => (
        <Link key={c.id} to={`/catalog?c=${c.id}`} className="card card-hover p-6">
          <div className="text-xl font-bold">{c.name}</div><p className="mt-1 text-sm text-muted">{c.description}</p>
          <div className="mt-4 text-sm font-semibold text-accent">{games.filter(g => g.category === c.id).length} игр</div>
        </Link>))}
    </div></div>
)
export function FavoritesPage() {
  const { favorites } = useLibrary()
  return <div className="page"><Title>Избранное</Title><GameGrid list={games.filter(g => favorites.includes(g.id))} empty="Нажми на сердечко у игры, и она появится здесь." /></div>
}
export function RecentPage() {
  const { recent } = useLibrary()
  return <div className="page"><Title>Недавно запущенные</Title><GameGrid list={recent.map(getGame).filter(Boolean) as typeof games} empty="Вы ещё ничего не запускали." /></div>
}
export function GamePage() {
  const game = getGame(useParams().id)
  const { markPlayed, favorites, toggleFavorite } = useLibrary()
  const Play = game ? players[game.id] : undefined
  useEffect(() => { if (game && Play) markPlayed(game.id) }, [game?.id])
  if (game && Play) return <div className="page"><Title sub={game.description}>{game.title}</Title><Play /></div>
  if (!game) return <div className="page"><Title>Игра не найдена</Title><Link to="/catalog" className="btn-primary">В каталог</Link></div>
  const fav = favorites.includes(game.id)
  return (
    <div className="page">
      <div className="card overflow-hidden">
        <div className="h-48 md:h-64" style={{ background: `radial-gradient(circle at 30% 20%, hsl(${game.hue} 90% 70% / .55), transparent 60%), linear-gradient(135deg, hsl(${game.hue} 70% 35%), hsl(${game.hue + 30} 60% 14%))` }} />
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-extrabold">{game.title}</h1><p className="mt-2 text-muted">{game.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary disabled:opacity-50" disabled={!game.ready} onClick={() => markPlayed(game.id)}><Play size={18} />{game.ready ? 'Играть' : 'Скоро'}</button>
            <button className="btn-ghost" onClick={() => toggleFavorite(game.id)}><Heart size={18} className={fav ? 'fill-primary text-primary' : ''} />{fav ? 'В избранном' : 'В избранное'}</button>
          </div>
          <p className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-muted">Эта игра ещё не готова. Сейчас доступна только Royal Solitaire (категория «Карточные»).</p>
        </div>
      </div>
    </div>
  )
}
export function AssistantPage() {
  const [text, setText] = useState('')
  return (
    <div className="page"><Title sub="Интерфейс готов, подключение ИИ будет на отдельном этапе.">AI Assistant</Title>
      <div className="card flex min-h-[320px] flex-col p-4 md:p-6">
        <div className="flex flex-1 items-center justify-center text-center text-muted"><div><Sparkles className="mx-auto mb-3 text-accent" size={32} />Спроси, во что поиграть сегодня.</div></div>
        <div className="mt-4 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Ваш вопрос…" className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-bg/60 px-4 text-base outline-none focus:border-primary" />
          <button className="btn-primary" disabled aria-label="Отправить"><Send size={18} /></button>
        </div>
      </div></div>
  )
}
export function SettingsPage() {
  const { settings, updateSettings } = useLibrary()
  return (
    <div className="page"><Title>Настройки</Title>
      <div className="card divide-y divide-white/5">
        <label className="flex min-h-[64px] cursor-pointer items-center justify-between p-5">
          <div><div className="font-bold">Фоновые эффекты</div><div className="text-sm text-muted">3D-кубы, сферы и свечение</div></div>
          <input type="checkbox" className="h-6 w-6 accent-[#8B5CF6]" checked={settings.effects} onChange={e => updateSettings({ effects: e.target.checked })} />
        </label>
        <div className="flex min-h-[64px] items-center justify-between p-5 opacity-60">
          <div><div className="font-bold">Светлая тема</div><div className="text-sm text-muted">Скоро: токены уже подготовлены</div></div>
          <span className="text-sm text-muted">Скоро</span>
        </div>
      </div></div>
  )
}
