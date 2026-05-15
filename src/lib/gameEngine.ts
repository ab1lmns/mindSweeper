import seedrandom from 'seedrandom'
import type { Cell, GameState, GameMove, Difficulty, GameConfig } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'

export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function getDailySeed(): string {
  return new Date().toISOString().split('T')[0]
}

function getNeighbors(cells: Cell[][], x: number, y: number, w: number, h: number): Cell[] {
  const result: Cell[] = []
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < w && ny >= 0 && ny < h)
        result.push(cells[ny][nx])
    }
  return result
}

export function createGameState(difficultyOrConfig: Difficulty | GameConfig, seed?: string): GameState {
  const cfg = typeof difficultyOrConfig === 'string' 
    ? DIFFICULTY_CONFIG[difficultyOrConfig as string]
    : difficultyOrConfig as GameConfig

  const s = seed ?? generateSeed()
  const rng = seedrandom(s)
  const { width: w, height: h, mines } = cfg

  const cells: Cell[][] = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => ({
      x, y, isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0,
    }))
  )

  // Place mines
  const positions: [number, number][] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      positions.push([x, y])

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }

  for (let i = 0; i < mines; i++) {
    const [x, y] = positions[i]
    cells[y][x].isMine = true
  }

  // Neighbor counts
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (!cells[y][x].isMine)
        cells[y][x].neighborCount = getNeighbors(cells, x, y, w, h).filter(c => c.isMine).length

  return {
    cells, width: w, height: h, minesCount: mines, seed: s,
    status: 'idle', startTime: null, endTime: null, moves: [], flagsPlaced: 0,
  }
}

export function revealCell(state: GameState, x: number, y: number): GameState {
  if (state.status === 'won' || state.status === 'lost') return state

  const cells = state.cells.map(row => row.map(c => ({ ...c })))
  const cell = cells[y][x]
  if (cell.isRevealed || cell.isFlagged) return state

  const now = Date.now()
  const move: GameMove = { action: 'reveal', x, y, timestamp: now }
  const startTime = state.startTime ?? now

  // First click safety — regenerate if mine
  if (cell.isMine && state.status === 'idle') {
    const newState = createGameState(
      Object.entries(DIFFICULTY_CONFIG).find(([, v]) => v.mines === state.minesCount)?.[0] as Difficulty ?? 'medium'
    )
    return revealCell({ ...newState, startTime }, x, y)
  }

  if (cell.isMine) {
    // Game over — reveal all mines
    for (let cy = 0; cy < state.height; cy++)
      for (let cx = 0; cx < state.width; cx++)
        if (cells[cy][cx].isMine) cells[cy][cx].isRevealed = true
    cell.isRevealed = true
    return { ...state, cells, status: 'lost', startTime, endTime: now, moves: [...state.moves, move] }
  }

  // Flood fill
  const queue: [number, number][] = [[x, y]]
  while (queue.length) {
    const [cx, cy] = queue.shift()!
    const c = cells[cy][cx]
    if (c.isRevealed || c.isFlagged) continue
    c.isRevealed = true
    if (c.neighborCount === 0)
      getNeighbors(cells, cx, cy, state.width, state.height).forEach(n => {
        if (!n.isRevealed) queue.push([n.x, n.y])
      })
  }

  // Check win
  const won = cells.flat().every(c => c.isMine || c.isRevealed)
  return {
    ...state, cells,
    status: won ? 'won' : 'playing',
    startTime,
    endTime: won ? now : null,
    moves: [...state.moves, move],
  }
}

export function toggleFlag(state: GameState, x: number, y: number): GameState {
  if (state.status === 'won' || state.status === 'lost') return state
  const cells = state.cells.map(row => row.map(c => ({ ...c })))
  const cell = cells[y][x]
  if (cell.isRevealed) return state
  const wasFlagged = cell.isFlagged
  cell.isFlagged = !wasFlagged
  const move: GameMove = { action: wasFlagged ? 'unflag' : 'flag', x, y, timestamp: Date.now() }
  const flagsPlaced = cells.flat().filter(c => c.isFlagged).length
  return { ...state, cells, moves: [...state.moves, move], flagsPlaced }
}

export function calcProbabilities(state: GameState): number[][] {
  const { cells, width: w, height: h, minesCount } = state
  const probs: number[][] = Array.from({ length: h }, () => Array(w).fill(-1))
  const flagsTotal = cells.flat().filter(c => c.isFlagged).length
  const remaining = minesCount - flagsTotal
  const unrevealed = cells.flat().filter(c => !c.isRevealed && !c.isFlagged).length
  if (unrevealed === 0) return probs
  const base = remaining / unrevealed

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cell = cells[y][x]
      if (cell.isRevealed || cell.isFlagged) continue
      const revNeighbors = getNeighbors(cells, x, y, w, h).filter(c => c.isRevealed && c.neighborCount > 0)
      if (!revNeighbors.length) { probs[y][x] = base; continue }
      let maxP = base
      for (const nb of revNeighbors) {
        const nbUnrev = getNeighbors(cells, nb.x, nb.y, w, h).filter(c => !c.isRevealed && !c.isFlagged)
        const nbFlags = getNeighbors(cells, nb.x, nb.y, w, h).filter(c => c.isFlagged).length
        const rem = nb.neighborCount - nbFlags
        if (nbUnrev.length > 0) maxP = Math.max(maxP, rem / nbUnrev.length)
      }
      probs[y][x] = Math.min(1, maxP)
    }
  }
  return probs
}

export function calcEloChange(currentElo: number, result: 'win' | 'loss', difficulty: Difficulty, timeSecs: number, gamesPlayed: number): number {
  const K = gamesPlayed < 30 ? 32 : 16
  const mult = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : difficulty === 'easy' ? 1 : 2
  let change = Math.round(K * mult * (result === 'win' ? 0.5 : -0.5))
  if (result === 'win') {
    const optimal = { easy: 30, medium: 90, hard: 180, custom: 90 }[difficulty]
    if (optimal && timeSecs < optimal) change += Math.round((optimal - timeSecs) / optimal * 8)
  }
  return change
}

export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
