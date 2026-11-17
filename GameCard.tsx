import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Game } from '../types'
import { useLibrary } from '../hooks/useLibrary'
import { categories } from '../games/registry'

export default function GameCard({ game }: { game: Game }) {
  const { favorites, toggleFavorite } = useLibrary()
  const fav = favorites.includes(game.id)
  const cat = categories.find(c => c.id === game.category)?.name
  return (
    <div className="card card-hover relative overflow-hidden">
      <Link to={`/game/${game.id}`} className="block">
        <div className="h-36" style={{ background: `radial-gradient(circle at 30% 20%, hsl(${game.hue} 90% 70% / .55), transparent 60%), linear-gradient(135deg, hsl(${game.hue} 70% 35%), hsl(${game.hue + 30} 60% 14%))` }} />
        <div className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">{cat}</div>
          <div className="mt-1 text-lg font-bold">{game.title}</div>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{game.description}</p>
        </div>
      </Link>
      <button onClick={() => toggleFavorite(game.id)} aria-label="Избранное" aria-pressed={fav}
        className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-bg/50 backdrop-blur transition active:scale-90">
        <Heart size={20} className={fav ? 'fill-primary text-primary' : 'text-ink'} />
      </button>
    </div>
  )
}
