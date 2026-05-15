import { useState, useCallback, useEffect, useRef } from 'react'
import { createGameState, revealCell, toggleFlag, generateSeed } from '@/lib/gameEngine'
import type { Difficulty, GameState } from '@/types'

const PENALTY = 10 // seconds deducted on mine
const BASE_POINTS = 10
const CLEAR_BONUS = 500

export function useRushGame(initialDifficulty: Difficulty = 'easy', initialTime: number = 120) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [totalTime, setTotalTime] = useState(initialTime)
  const [state, setState] = useState<GameState>(() => createGameState(initialDifficulty))
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [score, setScore] = useState(0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [isActive, setIsActive] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  
  // Track visual feedback
  const [lastAction, setLastAction] = useState<'hit' | 'clear' | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isActive && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsGameOver(true)
            setIsActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isActive, isGameOver])

  const reveal = useCallback((x: number, y: number) => {
    if (isGameOver) return

    if (!isActive) setIsActive(true)

    setState((prev) => {
      const nextState = revealCell(prev, x, y)
      
      // Calculate how many cells were newly revealed
      const prevRevealed = prev.cells.flat().filter(c => c.isRevealed).length
      const nextRevealed = nextState.cells.flat().filter(c => c.isRevealed).length
      const newlyRevealed = nextRevealed - prevRevealed

      if (newlyRevealed > 0 && nextState.status === 'playing') {
        setScore(s => s + Math.floor(newlyRevealed * BASE_POINTS * multiplier))
        setMultiplier(m => Math.min(5.0, m + 0.1))
        setLastAction(null)
      }

      if (nextState.status === 'lost') {
        // Penalty!
        setTimeLeft(t => Math.max(0, t - PENALTY))
        setMultiplier(1.0)
        setLastAction('hit')
        // Instantly generate new board
        return createGameState(difficulty, generateSeed())
      }

      if (nextState.status === 'won') {
        // Board cleared!
        setScore(s => s + Math.floor(CLEAR_BONUS * multiplier))
        setMultiplier(m => Math.min(5.0, m + 0.5))
        setLastAction('clear')
        // Instantly generate new board
        return createGameState(difficulty, generateSeed())
      }

      return nextState
    })
  }, [isActive, isGameOver, multiplier, difficulty])

  const flag = useCallback((x: number, y: number) => {
    if (isGameOver) return
    setState(s => toggleFlag(s, x, y))
  }, [isGameOver])

  const restart = useCallback((newDiff?: Difficulty, newTime?: number) => {
    const d = newDiff ?? difficulty
    const t = newTime ?? totalTime
    if (newDiff) setDifficulty(d)
    if (newTime) setTotalTime(t)

    setState(createGameState(d, generateSeed()))
    setTimeLeft(t)
    setScore(0)
    setMultiplier(1.0)
    setIsActive(false)
    setIsGameOver(false)
    setLastAction(null)
  }, [difficulty, totalTime])

  return {
    state,
    timeLeft,
    score,
    multiplier,
    isActive,
    isGameOver,
    lastAction,
    reveal,
    flag,
    restart
  }
}
