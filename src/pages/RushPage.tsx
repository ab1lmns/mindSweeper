import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Timer, Target, RefreshCw } from 'lucide-react'
import { useRushGame } from '@/hooks/useRushGame'
import GameBoard from '@/components/game/GameBoard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Difficulty } from '@/types'

export default function RushPage() {
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('easy')
  const [selectedTime, setSelectedTime] = useState(120)
  const [isConfiguring, setIsConfiguring] = useState(true)

  const { state, timeLeft, score, multiplier, isActive, isGameOver, lastAction, reveal, flag, restart } = useRushGame(selectedDiff, selectedTime)
  const [boardKey, setBoardKey] = useState(0)
  const { user, profile, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [savedScore, setSavedScore] = useState(false)
  const [localBest, setLocalBest] = useState(() => parseInt(localStorage.getItem('rush_best_score') || '0', 10))

  // Force board re-render animation when state seed changes
  useEffect(() => {
    setBoardKey(prev => prev + 1)
  }, [state.seed])

  // Save score on game over
  useEffect(() => {
    if (isGameOver && score > 0) {
      if (score > localBest) {
        setLocalBest(score)
        localStorage.setItem('rush_best_score', score.toString())
      }
      
      if (user && profile && score > (profile.best_score_rush || 0)) {
        setIsSaving(true)
        supabase
          .from('profiles')
          .update({ best_score_rush: score })
          .eq('id', user.id)
          .then(({ error }) => {
            if (!error) {
              setSavedScore(true)
              refreshProfile()
            }
            setIsSaving(false)
          })
      }
    }
  }, [isGameOver, user, profile, score, refreshProfile, localBest])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-12 overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-0 transition-colors duration-300 ${
          lastAction === 'hit' ? 'bg-accent/10' : lastAction === 'clear' ? 'bg-safe/10' : 'bg-transparent'
        }`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Header / HUD */}
        <div className="w-full flex items-end justify-between mb-8 px-2">
          {/* Timer */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1 mb-1">
              <Timer size={12} /> Время
            </span>
            <div className={`font-display font-bold text-5xl leading-none transition-colors ${
              timeLeft <= 10 ? 'text-accent animate-pulse' : 'text-foreground'
            }`}>
              {timeLeft}s
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-1 mb-1">
              <Target size={12} /> Очки
            </span>
            <div className="flex items-baseline gap-2">
              <motion.div 
                key={score}
                initial={{ scale: 1.2, color: '#39d98a' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="font-display font-bold text-4xl leading-none"
              >
                {score}
              </motion.div>
              {(localBest > 0 || (profile?.best_score_rush && profile.best_score_rush > 0)) && (
                <span className="text-sm font-bold text-warn/80 font-display">
                  / {Math.max(localBest, profile?.best_score_rush || 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Combo Multiplier */}
        <div className="h-12 mb-4 w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {multiplier > 1.0 && (
              <motion.div
                key={multiplier}
                initial={{ scale: 0.5, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-warn/10 border border-warn/20"
              >
                <Zap size={16} className="text-warn" />
                <span className="font-display font-bold text-xl text-warn tracking-wide">
                  x{multiplier.toFixed(1)} COMBO
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Penalty / Bonus Feedback */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-none z-50">
          <AnimatePresence>
            {lastAction === 'hit' && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -40 }}
                exit={{ opacity: 0 }}
                className="font-display font-bold text-4xl text-accent drop-shadow-[0_0_15px_rgba(255,61,90,0.5)]"
              >
                -10s
              </motion.div>
            )}
            {lastAction === 'clear' && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -40 }}
                exit={{ opacity: 0 }}
                className="font-display font-bold text-4xl text-safe drop-shadow-[0_0_15px_rgba(57,217,138,0.5)]"
              >
                CLEAR!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board Container */}
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isConfiguring && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg/90 backdrop-blur-md rounded-2xl border border-border">
              <Zap size={48} className="text-warn mb-4" />
              <h2 className="font-display font-bold text-2xl mb-2">Настройки Rush</h2>
              
              <div className="flex flex-col gap-4 mb-6 w-full max-w-[240px]">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1 block">Сложность</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                      <button key={d} onClick={() => setSelectedDiff(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                          selectedDiff === d ? 'bg-primary text-foreground border-primary' : 'bg-surface border-border text-muted hover:border-primary/50'
                        }`}>
                        {d === 'easy' ? 'Лёгкая' : d === 'medium' ? 'Средняя' : 'Сложная'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1 block">Время</label>
                  <div className="flex gap-2">
                    {[60, 120, 300].map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                          selectedTime === t ? 'bg-warn text-bg border-warn' : 'bg-surface border-border text-muted hover:border-warn/50'
                        }`}>
                        {t / 60} мин
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => {
                restart(selectedDiff, selectedTime)
                setIsConfiguring(false)
              }}
                className="px-8 py-3 w-full max-w-[240px] rounded-xl bg-primary text-foreground font-bold hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                Готово
              </button>
            </div>
          )}

          {!isActive && !isGameOver && !isConfiguring && score === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-foreground font-display font-bold text-xl animate-pulse bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                Кликни любую клетку чтобы начать
              </p>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg/90 backdrop-blur-md rounded-2xl border border-accent/30 shadow-[0_0_50px_rgba(255,61,90,0.1)]">
              <h2 className="font-display font-bold text-4xl text-foreground mb-1">TIME'S UP</h2>
              <p className="text-accent font-semibold text-sm tracking-widest mb-6">РЕЖИМ RUSH ЗАВЕРШЕН</p>
              
              <div className="flex flex-col items-center mb-8">
                <span className="text-muted text-xs uppercase tracking-widest mb-1">Финальный Счет</span>
                <span className="font-display font-bold text-6xl text-warn">{score}</span>
                {savedScore && (
                  <span className="text-safe text-xs font-bold uppercase mt-2 animate-pulse">
                    Новый Рекорд Сохранен!
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => {
                  setIsConfiguring(true)
                  restart(selectedDiff, selectedTime)
                }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface text-muted hover:text-foreground transition-all">
                  Настройки
                </button>
                <button onClick={() => restart(selectedDiff, selectedTime)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-bg font-bold hover:bg-gray-200 transition-all">
                  <RefreshCw size={18} /> Ещё раз
                </button>
              </div>
            </div>
          )}

          {/* The Board itself */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={boardKey}
              initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute pointer-events-auto"
            >
              <GameBoard
                cells={state.cells}
                probs={null}
                showProbs={false}
                onReveal={reveal}
                onFlag={flag}
                disabled={isGameOver || (!isActive && score > 0)}
                cellSize={32}
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
