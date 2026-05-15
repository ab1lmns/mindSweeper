import { memo, useCallback } from 'react'
import type { Cell } from '@/types'
import clsx from 'clsx'

interface BoardProps {
  cells: Cell[][]
  probs?: number[][] | null
  showProbs?: boolean
  onReveal: (x: number, y: number) => void
  onFlag: (x: number, y: number) => void
  disabled?: boolean
  cellSize?: number
}

function probToColor(p: number): string {
  if (p < 0.1) return 'rgba(57,217,138,0.18)'
  if (p < 0.25) return 'rgba(255,184,0,0.18)'
  if (p < 0.5) return 'rgba(255,100,50,0.22)'
  return `rgba(255,61,90,${Math.min(0.45, p * 0.6)})`
}

const NUM_CLASSES = ['', 'num-1', 'num-2', 'num-3', 'num-4', 'num-5', 'num-6', 'num-7', 'num-8']

const CellTile = memo(({ cell, prob, showProb, onReveal, onFlag, disabled, size }: {
  cell: Cell; prob: number; showProb: boolean
  onReveal: (x: number, y: number) => void
  onFlag: (x: number, y: number) => void
  disabled?: boolean; size: number
}) => {
  const handleClick = useCallback(() => { if (!disabled) onReveal(cell.x, cell.y) }, [cell.x, cell.y, disabled, onReveal])
  const handleCtx = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); if (!disabled) onFlag(cell.x, cell.y)
  }, [cell.x, cell.y, disabled, onFlag])

  const style = {
    width: size, height: size, 
    fontSize: size >= 32 ? 16 : size > 26 ? 13 : 11,
    backgroundColor: showProb && prob >= 0 && !cell.isRevealed && !cell.isFlagged ? probToColor(prob) : undefined,
  }

  if (cell.isRevealed) {
    if (cell.isMine) return (
      <div style={style} className="flex items-center justify-center bg-liberty-red/30 border border-liberty-red/50 backdrop-blur-md animate-explode cursor-default select-none rounded-[4px] shadow-[inset_0_0_10px_rgba(249,95,95,0.5)]">
        <span style={{ fontSize: size >= 32 ? 18 : size > 26 ? 14 : 11 }}>💣</span>
      </div>
    )
    return (
      <div style={style} className={clsx(
        'flex items-center justify-center border border-glassborder/5 bg-black/30 backdrop-blur-sm cursor-default select-none animate-reveal rounded-[4px]',
        cell.neighborCount > 0 && NUM_CLASSES[cell.neighborCount]
      )}>
        {cell.neighborCount > 0 && <span className="font-mono font-bold drop-shadow-md">{cell.neighborCount}</span>}
      </div>
    )
  }

  return (
    <div
      style={style}
      className={clsx(
        'flex items-center justify-center border border-glassborder/10 cursor-pointer select-none transition-all duration-200 rounded-[4px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
        disabled ? 'bg-glass/5' : 'bg-glass/10 hover:bg-glass/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]',
        cell.isFlagged && 'bg-accent/10 border-accent/30',
      )}
      onClick={handleClick}
      onContextMenu={handleCtx}
    >
      {cell.isFlagged && <span className="animate-flag-in" style={{ fontSize: size >= 32 ? 18 : size > 26 ? 13 : 10 }}>🚩</span>}
      {showProb && prob >= 0 && !cell.isFlagged && (
        <span className="text-foreground/40 font-mono font-bold tracking-tighter" style={{ fontSize: size >= 32 ? 10 : 8 }}>
          {Math.round(prob * 100)}%
        </span>
      )}
    </div>
  )
})

CellTile.displayName = 'CellTile'

export default function GameBoard({ cells, probs, showProbs, onReveal, onFlag, disabled, cellSize = 28 }: BoardProps) {
  if (!cells.length) return null
  const cols = cells[0].length

  return (
    <div
      className="grid gap-[2px] p-[2px] bg-glass/5 backdrop-blur-xl border border-glassborder/10 rounded-xl shadow-2xl relative select-none w-fit"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
    >
      {cells.map(row => row.map(cell => (
        <CellTile
          key={`${cell.x}-${cell.y}`}
          cell={cell}
          prob={probs?.[cell.y]?.[cell.x] ?? -1}
          showProb={showProbs ?? false}
          onReveal={onReveal}
          onFlag={onFlag}
          disabled={disabled}
          size={cellSize}
        />
      )))}
    </div>
  )
}
