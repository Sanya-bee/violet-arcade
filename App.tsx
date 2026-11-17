import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import Background from './components/Background'
import { BottomNav, TopNav } from './components/Nav'
import GameGrid, { Title } from './components/GameGrid'
import { categories, games } from './games/registry'
import { AssistantPage, CategoriesPage, FavoritesPage, GamePage, HomePage, RecentPage, SettingsPage } from './pages/Pages'

function Catalog() {
  const [p] = useSearchParams(); const c = p.get('c'); const cat = categories.find(x => x.id === c)
  return <div className="page"><Title sub={cat?.description ?? `Игр в каталоге: ${games.length}`}>{cat?.name ?? 'Каталог'}</Title>
    <GameGrid list={c ? games.filter(g => g.category === c) : games} empty="Пока пусто" /></div>
}
export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="relative min-h-full">
      <Background />
      <div className="relative z-10">
        <TopNav />
        {/* key перезапускает CSS-анимацию появления при смене маршрута */}
        <main key={pathname}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/recent" element={<RecentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
