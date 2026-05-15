export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom'
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface GameConfig {
  width: number
  height: number
  mines: number
}
export type GameResult = 'win' | 'loss'

export interface Cell {
  x: number
  y: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborCount: number
}

export interface GameMove {
  action: 'reveal' | 'flag' | 'unflag'
  x: number
  y: number
  timestamp: number
}

export interface GameState {
  cells: Cell[][]
  width: number
  height: number
  minesCount: number
  seed: string
  status: GameStatus
  startTime: number | null
  endTime: number | null
  moves: GameMove[]
  flagsPlaced: number
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  elo_rating: number
  country: string
  city: string
  is_pro: boolean
  games_played: number
  games_won: number
  best_time_easy: number | null
  best_time_medium: number | null
  best_time_hard: number | null
  best_score_rush: number
  current_streak: number
  longest_streak: number
  created_at: string
}

export interface GameRecord {
  id: string
  user_id: string
  difficulty: Difficulty
  result: GameResult
  time_seconds: number
  created_at: string
}

export interface LeaderboardEntry {
  username: string
  avatar_url: string | null
  elo_rating: number
  city: string
  games_played: number
  games_won: number
  best_time_hard: number | null
}

export const DIFFICULTY_CONFIG: Record<string, GameConfig & { label: string }> = {
  easy:   { width: 9,  height: 9,  mines: 10,  label: 'Лёгкий'  },
  medium: { width: 16, height: 16, mines: 40,  label: 'Средний' },
  hard:   { width: 30, height: 16, mines: 99,  label: 'Сложный' },
} as const

export const CAMPAIGN_LEVELS: GameConfig[] = [
  { width: 5,  height: 5,  mines: 3 },   // 1
  { width: 6,  height: 6,  mines: 5 },   // 2
  { width: 7,  height: 7,  mines: 7 },   // 3
  { width: 8,  height: 8,  mines: 8 },   // 4
  { width: 9,  height: 9,  mines: 10 },  // 5 (Easy equivalent)
  { width: 10, height: 10, mines: 13 },  // 6
  { width: 11, height: 11, mines: 17 },  // 7
  { width: 12, height: 12, mines: 20 },  // 8
  { width: 13, height: 13, mines: 25 },  // 9
  { width: 14, height: 14, mines: 30 },  // 10
  { width: 15, height: 15, mines: 35 },  // 11
  { width: 16, height: 16, mines: 40 },  // 12 (Medium equivalent)
  { width: 18, height: 16, mines: 48 },  // 13
  { width: 20, height: 16, mines: 55 },  // 14
  { width: 22, height: 16, mines: 63 },  // 15
  { width: 24, height: 16, mines: 72 },  // 16
  { width: 26, height: 16, mines: 80 },  // 17
  { width: 28, height: 16, mines: 88 },  // 18
  { width: 30, height: 16, mines: 99 },  // 19 (Hard equivalent)
  { width: 30, height: 20, mines: 130 }, // 20 (Expert)
]

export const ELO_TIERS = [
  { name: 'Bronze',   min: 0,    color: '#cd7f32', emoji: '🥉' },
  { name: 'Silver',   min: 1200, color: '#c0c0c0', emoji: '🥈' },
  { name: 'Gold',     min: 1400, color: '#ffd700', emoji: '🥇' },
  { name: 'Platinum', min: 1600, color: '#a8d8ea', emoji: '💎' },
  { name: 'Diamond',  min: 1800, color: '#b9f2ff', emoji: '🔷' },
  { name: 'Legend',   min: 2000, color: '#ff3d5a', emoji: '👑' },
] as const

export function getEloTier(elo: number) {
  return [...ELO_TIERS].reverse().find(t => elo >= t.min) ?? ELO_TIERS[0]
}

export const ACHIEVEMENTS = [
  { key: 'first_win',        icon: '🎉', title: 'Первая победа',       desc: 'Выиграй первую игру',                     rarity: 'common'    },
  { key: 'speed_demon',      icon: '⚡', title: 'Демон скорости',      desc: 'Easy быстрее 30 секунд',                  rarity: 'rare'      },
  { key: 'no_flag_victory',  icon: '🚫', title: 'Без флагов',          desc: 'Выиграй не поставив ни одного флага',     rarity: 'epic'      },
  { key: 'perfect_hard',     icon: '💎', title: 'Идеальный Hard',      desc: 'Выиграй Hard за первую попытку',          rarity: 'legendary' },
  { key: 'daily_warrior',    icon: '🗓️', title: 'Воин дня',            desc: '7 Daily Challenge подряд',                rarity: 'rare'      },
  { key: 'legend_rank',      icon: '👑', title: 'Легенда',             desc: 'Достигни ранга Legend',                   rarity: 'legendary' },
  { key: 'century',          icon: '💯', title: 'Сотня',               desc: 'Сыграй 100 игр',                         rarity: 'common'    },
  { key: 'no_hints',         icon: '🧠', title: 'Чистый разум',        desc: '10 побед подряд без AI подсказок',        rarity: 'epic'      },
] as const
