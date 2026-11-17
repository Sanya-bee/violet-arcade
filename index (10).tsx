import type { ComponentType } from 'react'
import SolitaireGame from './solitaire'
import TilesGame from './tiles'
import SudokuGame from './sudoku'
import BricksGame from './bricks'
import RunnerGame from './runner'
import TowerGame from './tower'
// id из registry.ts -> компонент игры. Новая игра = папка + строка здесь.
export const players: Record<string, ComponentType> = { solitaire: SolitaireGame, tiles: TilesGame, sudoku: SudokuGame, bricks: BricksGame, runner: RunnerGame, tower: TowerGame }
