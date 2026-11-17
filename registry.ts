import type { Category, Game } from '../types'
// Каждая будущая игра — отдельная папка в src/games/<id>/ и запись здесь.
export const categories: Category[] = [
  { id: 'puzzle', name: 'Головоломки', description: 'Подумай и найди решение' },
  { id: 'arcade', name: 'Аркады', description: 'Скорость и реакция' },
  { id: 'strategy', name: 'Стратегии', description: 'Планирование на несколько ходов' },
  { id: 'cards', name: 'Карточные', description: 'Классика и новые правила' },
  { id: 'logic', name: 'Логика', description: 'Чистая математика и порядок' },
]
export const games: Game[] = [
  { id: 'tiles', title: 'Violet Tiles', description: 'Сдвигай плитки и собирай числа.', category: 'puzzle', hue: 270, ready: true },
  { id: 'runner', title: 'Neon Runner', description: 'Бесконечный забег по неоновому городу.', category: 'arcade', hue: 290, ready: true },
  { id: 'tower', title: 'Crystal Tower', description: 'Защити кристалл от волн врагов.', category: 'strategy', hue: 255, ready: true },
  { id: 'solitaire', title: 'Royal Solitaire', description: 'Пасьянс с красивыми картами.', category: 'cards', hue: 310, ready: true },
  { id: 'sudoku', title: 'Night Sudoku', description: 'Судоку для вечерней партии.', category: 'logic', hue: 240, ready: true },
  { id: 'bricks', title: 'Prism Bricks', description: 'Разбей блоки отражённым лучом.', category: 'arcade', hue: 280, ready: true },
]
export const getGame = (id?: string) => games.find(g => g.id === id)
