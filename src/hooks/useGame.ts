import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createGameState, revealCell, toggleFlag,
  calcProbabilities, generateSeed, formatTime
} from '@/lib/gameEngine'
import type { Difficulty, GameState, GameConfig } from '@/types'

export interface AcademyMessage {
  id: number
  text: string
  type: 'info' | 'warning' | 'error' | 'success'
}

export function useGame(initialDifficulty: Difficulty | GameConfig = 'medium', customSeed?: string, academyMode: boolean = false) {
  const [difficulty, setDifficulty] = useState<Difficulty | GameConfig>(initialDifficulty)
  const [state, setState] = useState<GameState>(() =>
    createGameState(difficulty, customSeed)
  )
  const [showProbs, setShowProbs] = useState(false)
  const [probs, setProbs] = useState<number[][] | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [riskyGuesses, setRiskyGuesses] = useState(0)
  const [academyMessages, setAcademyMessages] = useState<AcademyMessage[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addAcademyMessage = useCallback((text: string, type: AcademyMessage['type']) => {
    setAcademyMessages(prev => [...prev, { id: Date.now() + Math.random(), text, type }])
  }, [])

  // Timer
  useEffect(() => {
    if (state.status === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (state.startTime ?? Date.now())) / 1000))
      }, 500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (state.endTime && state.startTime)
        setElapsed(Math.floor((state.endTime - state.startTime) / 1000))
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.status, state.startTime, state.endTime])


  const reveal = useCallback((x: number, y: number) => {
    setState(s => {
      if (academyMode && s.status === 'playing') {
        const cell = s.cells[y][x]
        if (!cell.isRevealed && !cell.isFlagged) {
          const p = calcProbabilities(s)
          const prob = p[y][x]
          const hasSafe = p.flat().some(v => v === 0)
          
          if (prob > 0 && prob < 1) {
            if (hasSafe) {
              setRiskyGuesses(prev => prev + 1)
              addAcademyMessage(`Рискованный ход! Шанс мины был ${(prob*100).toFixed(0)}%, хотя на поле есть 100% безопасные клетки.`, 'warning')
            }
          } else if (prob === 1) {
            addAcademyMessage(`Очевидная мина! Вероятность 100%.`, 'error')
          }
        }
      }
      return revealCell(s, x, y)
    })
  }, [academyMode, addAcademyMessage])

  const flag = useCallback((x: number, y: number) => {
    setState(s => toggleFlag(s, x, y))
  }, [])

  const restart = useCallback((diffOverride?: Difficulty | GameConfig, seedOverride?: string) => {
    if (diffOverride) setDifficulty(diffOverride)
    setState(createGameState(diffOverride ?? difficulty, seedOverride ?? generateSeed()))
    setElapsed(0)
    setShowProbs(false)
    setProbs(null)
    setRiskyGuesses(0)
    setAcademyMessages([])
  }, [difficulty])

  const toggleProbs = useCallback(() => {
    setShowProbs(prev => {
      if (!prev) setState(s => { setProbs(calcProbabilities(s)); return s })
      return !prev
    })
  }, [])

  const minesLeft = state.minesCount - state.flagsPlaced

  return {
    state, elapsed, minesLeft,
    showProbs, probs,
    elapsedFormatted: formatTime(elapsed),
    riskyGuesses, academyMessages, addAcademyMessage,
    reveal, flag, restart, toggleProbs,
  }
}
