import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CAMPAIGN_LEVELS } from '@/types'
import { useGame } from '@/hooks/useGame'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Trophy, ArrowRight, ArrowLeft } from 'lucide-react'
import GameBoard from '@/components/game/GameBoard'
import GameHUD from '@/components/game/GameHUD'
import { motion, AnimatePresence } from 'framer-motion'

export default function CampaignGamePage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const levelNum = parseInt(level || '1', 10)
  
  const levelConfig = CAMPAIGN_LEVELS[levelNum - 1]
  const [showVictory, setShowVictory] = useState(false)
  const processedRef = useRef(false)

  // Use state trick to force remount of useGame if level changes, 
  // or we can just rely on useEffect to call restart with new config.
  // Actually, useGame initial config only runs once. So we should restart if levelNum changes.
  
  const { state, elapsed, minesLeft, showProbs, probs, elapsedFormatted, reveal, flag, restart } = useGame(levelConfig, undefined, false)

  useEffect(() => {
    // Validate level
    if (isNaN(levelNum) || levelNum < 1 || levelNum > CAMPAIGN_LEVELS.length) {
      navigate('/levels')
      return
    }

    // Check if player has unlocked this level
    const saved = localStorage.getItem('campaign_unlocked')
    const unlocked = saved ? parseInt(saved, 10) : 1
    if (levelNum > unlocked) {
      navigate('/levels') // Redirect back if trying to access locked level
    }
  }, [levelNum, navigate])

  // When level changes, we must restart the game engine with new config
  useEffect(() => {
    if (levelConfig) {
      processedRef.current = false
      setShowVictory(false)
      restart(levelConfig)
    }
  }, [levelNum])

  useEffect(() => {
    async function updateStats() {
      if ((state.status === 'won' || state.status === 'lost') && !processedRef.current) {
        processedRef.current = true
        
        if (state.status === 'won') {
          setShowVictory(true)
          
          // Unlock next level
          const saved = localStorage.getItem('campaign_unlocked')
          const unlocked = saved ? parseInt(saved, 10) : 1
          if (levelNum === unlocked && levelNum < CAMPAIGN_LEVELS.length) {
            localStorage.setItem('campaign_unlocked', (levelNum + 1).toString())
          }
        }

        if (profile) {
          const wonIncrement = state.status === 'won' ? 1 : 0
          await supabase
            .from('profiles')
            .update({ 
              games_played: profile.games_played + 1,
              games_won: profile.games_won + wonIncrement
            })
            .eq('id', profile.id)
          await refreshProfile()
        }
      }
    }
    updateStats()
  }, [state.status, levelNum, profile])

  const handleRestart = () => {
    processedRef.current = false
    setShowVictory(false)
    restart()
  }

  const handleNextLevel = () => {
    processedRef.current = false
    setShowVictory(false)
    navigate(`/campaign/${levelNum + 1}`)
  }

  if (!levelConfig) return null

  // Calculate cell size to prevent huge boards from overflowing wildly
  const cellSize = levelConfig.width >= 24 ? 24 : 34

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/levels" className="p-3 bg-glass/10 hover:bg-glass/20 rounded-xl transition-colors border border-glassborder/20 shadow-lg text-foreground">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display font-black text-4xl text-foreground mb-1 flex items-center gap-3">
                Уровень {levelNum}
              </h1>
              <p className="text-foreground/60 font-medium">
                {levelConfig.width}x{levelConfig.height} сетка • {levelConfig.mines} мин
              </p>
            </div>
          </div>
        </div>

        {/* Main Glass Container */}
        <div className="rounded-[40px] bg-glass/5 backdrop-blur-3xl border border-glassborder/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-liberty-blue/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-liberty-purple/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <GameHUD
              minesLeft={minesLeft}
              elapsed={elapsedFormatted}
              status={state.status}
              showProbs={showProbs}
              onRestart={handleRestart}
              difficulty={'custom' as any}
              noRestart={false}
            />

            <div className="mt-8 flex justify-center">
              <div className="overflow-auto rounded-[24px] p-4 bg-black/20 border border-glassborder/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] inline-block">
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
            </div>

            {/* Post Game Overlay */}
            <AnimatePresence>
              {showVictory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[40px]"
                >
                  <div className="p-8 rounded-[32px] border text-center shadow-2xl backdrop-blur-xl max-w-md w-full mx-4 bg-safe/20 border-safe/30">
                    <Trophy size={64} className="text-safe mx-auto mb-6 drop-shadow-[0_0_15px_rgba(57,217,138,0.5)]" />
                    <h2 className="font-display font-black text-4xl mb-3 text-foreground drop-shadow-md">Уровень пройден!</h2>
                    <p className="text-foreground/80 font-medium mb-8">Отличная работа. Двигаемся дальше?</p>
                    
                    <div className="flex gap-4 w-full justify-center">
                      <Link to="/levels" className="flex-1 py-4 rounded-xl border border-glassborder/20 bg-glass/10 text-foreground hover:bg-glass/20 font-bold text-sm transition-colors shadow-sm">
                        Карта
                      </Link>
                      {levelNum < CAMPAIGN_LEVELS.length ? (
                        <button onClick={handleNextLevel} className="flex-1 py-4 rounded-xl bg-foreground text-background font-black text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                          Следующий <ArrowRight size={18} />
                        </button>
                      ) : (
                        <button onClick={handleRestart} className="flex-1 py-4 rounded-xl bg-foreground text-background font-black text-sm hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                          Пройти еще раз
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
