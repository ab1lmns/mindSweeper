import { Flag, Timer, RotateCcw, Brain } from 'lucide-react'
import clsx from 'clsx'
import type { Difficulty } from '@/types'

interface HUDProps {
  minesLeft: number
  elapsed: string
  status: string
  showProbs: boolean
  onRestart: () => void
  onToggleProbs?: () => void
  difficulty: Difficulty
  onDifficulty?: (d: Difficulty) => void
  noRestart?: boolean
}

const DIFFS: { key: Difficulty; label: string }[] = [
  { key: 'easy',   label: 'Easy'   },
  { key: 'medium', label: 'Medium' },
  { key: 'hard',   label: 'Hard'   },
]

export default function GameHUD({
  minesLeft, elapsed, status, showProbs,
  onRestart, onToggleProbs, difficulty, onDifficulty, noRestart,
}: HUDProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 w-full">
      {/* Left: Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-glass/10 backdrop-blur-md border border-glassborder/20 shadow-lg">
          <span className="flex items-center gap-1.5 font-mono font-bold text-lg text-liberty-red">
            <Flag size={18} />{minesLeft < 0 ? 0 : minesLeft}
          </span>
          <div className="w-[1px] h-5 bg-glass/20 mx-2" />
          <span className={clsx('flex items-center gap-1.5 font-mono font-bold text-lg', status === 'lost' ? 'text-liberty-red' : 'text-foreground')}>
            <Timer size={18} />{elapsed}
          </span>
        </div>

        {/* Status badge */}
        {status === 'won' && (
          <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-safe/20 text-safe border border-safe/30 backdrop-blur-md animate-slide-up shadow-lg shadow-safe/20">
            ✅ Разминировано!
          </span>
        )}
        {status === 'lost' && (
          <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-liberty-red/20 text-liberty-red border border-liberty-red/30 backdrop-blur-md animate-slide-up shadow-lg shadow-liberty-red/20">
            💥 Подрыв!
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Difficulty tabs */}
        {onDifficulty && (
          <div className="flex rounded-xl overflow-hidden border border-glassborder/20 bg-black/20 backdrop-blur-md text-xs font-bold p-1 gap-1 shadow-lg">
            {DIFFS.map(({ key, label }) => (
              <button key={key}
                onClick={() => onDifficulty(key)}
                className={clsx('px-3 py-1.5 rounded-lg transition-all', key === difficulty ? 'bg-foreground text-background shadow-sm' : 'text-foreground/60 hover:text-foreground hover:bg-glass/10')}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* AI probabilities */}
        {onToggleProbs && (
          <button onClick={onToggleProbs}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md border',
              showProbs ? 'bg-liberty-blue/20 text-liberty-blue border-liberty-blue/40' : 'bg-glass/5 text-foreground/60 border-glassborder/10 hover:bg-glass/10 hover:text-foreground'
            )}>
            <Brain size={14} /> AI Карта
          </button>
        )}

        {/* Restart */}
        {!noRestart && (
          <button onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-glass/10 text-foreground border border-glassborder/20 hover:bg-glass/20 hover:scale-105 transition-all shadow-lg backdrop-blur-md">
            <RotateCcw size={14} /> Заново
          </button>
        )}
      </div>
    </div>
  )
}
