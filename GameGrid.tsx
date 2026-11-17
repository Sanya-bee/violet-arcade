import type { Game } from '../types'
import GameCard from './GameCard'
export default function GameGrid({ list, empty }: { list: Game[]; empty: string }) {
  if (!list.length) return <div className="card p-10 text-center text-muted">{empty}</div>
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(g => <GameCard key={g.id} game={g} />)}</div>
}
export const Title = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="mb-6"><h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{children}</h1>{sub && <p className="mt-2 text-muted">{sub}</p>}</div>
)
