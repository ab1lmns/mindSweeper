import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import GameBoard from '@/components/game/GameBoard'
import GameHUD from '@/components/game/GameHUD'
import AICoachPanel from '@/components/game/AICoachPanel'
import { formatBoardState, getAIHint, getPostGameSummary } from '@/lib/groq'
import { BrainCircuit } from 'lucide-react'
import type { Difficulty } from '@/types'

export default function PlayPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const summaryFetchedRef = useRef(false)

  const { state, elapsed, minesLeft, showProbs, probs, elapsedFormatted, riskyGuesses, academyMessages, addAcademyMessage, reveal, flag, restart, toggleProbs } = useGame(difficulty, undefined, true)

  const handleDifficulty = (d: Difficulty) => {
    setDifficulty(d)
    summaryFetchedRef.current = false
    restart(d)
  }

  const handleRestart = () => {
    summaryFetchedRef.current = false
    restart()
  }

  const handleAskHint = async () => {
    setIsAnalyzing(true)
    const hint = await getAIHint(formatBoardState(state.cells))
    addAcademyMessage(hint, 'info')
    setIsAnalyzing(false)
  }

  // Post-game summary
  useEffect(() => {
    if ((state.status === 'won' || state.status === 'lost') && !summaryFetchedRef.current) {
      summaryFetchedRef.current = true
      setIsAnalyzing(true)
      getPostGameSummary(state.status, elapsedFormatted, riskyGuesses).then(summary => {
        addAcademyMessage(summary, state.status === 'won' ? 'success' : 'info')
        setIsAnalyzing(false)
      })
    }
  }, [state.status, elapsedFormatted, riskyGuesses, addAcademyMessage])

  // Responsive cell size
  const cellSize = difficulty === 'hard' ? 26 : 34

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-4xl text-foreground mb-2 flex items-center gap-3">
              <BrainCircuit className="text-liberty-blue" />
              AI Academy
            </h1>
            <p className="text-foreground/60 font-medium">Случайное поле гарантированно без угадываний (NG). Тренируй логику.</p>
          </div>
        </div>

        {/* Main Glass Container */}
        <div className="rounded-[40px] bg-glass/5 backdrop-blur-3xl border border-glassborder/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-liberty-blue/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-liberty-purple/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <GameHUD
              difficulty={difficulty}
              onDifficulty={handleDifficulty}
              minesLeft={minesLeft}
              elapsed={elapsedFormatted}
              status={state.status}
              showProbs={showProbs}
              onRestart={handleRestart}
              onToggleProbs={toggleProbs}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
              <div className="overflow-auto rounded-[24px] p-4 bg-black/20 border border-glassborder/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <GameBoard
                  cells={state.cells}
                  probs={probs}
                  showProbs={showProbs}
                  onReveal={reveal}
                  onFlag={flag}
                  disabled={state.status === 'won' || state.status === 'lost'}
                  cellSize={cellSize}
                />
              </div>

              <div className="flex-1 w-full lg:w-auto">
                <AnimatePresence>
                  <AICoachPanel
                    messages={academyMessages}
                    isAnalyzing={isAnalyzing}
                    onAskHint={handleAskHint}
                  />
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {(state.status === 'won' || state.status === 'lost') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-6 p-6 rounded-2xl border text-center backdrop-blur-md shadow-xl ${
                    state.status === 'won'
                      ? 'bg-safe/20 border-safe/30 text-safe'
                      : 'bg-liberty-red/20 border-liberty-red/30 text-liberty-red'
                  }`}>
                  <p className="text-xl font-bold mb-4 drop-shadow-md">
                    {state.status === 'won'
                      ? `🎉 Разминировано за ${elapsedFormatted}!`
                      : '💥 Попал на мину. Не сдавайся!'}
                  </p>
                  <button onClick={handleRestart}
                    className="px-8 py-3 rounded-xl bg-foreground text-background text-sm font-black hover:scale-105 transition-transform shadow-lg">
                    Ещё раз
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-sm font-bold text-foreground/40 mt-6 uppercase tracking-widest">
          ПКМ / долгое нажатие = поставить флаг
        </p>
      </div>
    </div>
  )
}
