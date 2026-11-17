export type CategoryId = 'puzzle' | 'arcade' | 'strategy' | 'cards' | 'logic'
export interface Category { id: CategoryId; name: string; description: string }
export interface Game {
  id: string; title: string; description: string; category: CategoryId
  hue: number            // для градиента обложки
  ready: boolean         // false = заглушка, механика ещё не реализована
}
export interface Settings { effects: boolean; theme: 'dark' | 'light' }
