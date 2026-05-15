import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import { getEloTier } from '@/types'
import { Trophy, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import GameBoard from '@/components/game/GameBoard'
import GameHUD from '@/components/game/GameHUD'
import { motion, AnimatePresence } from 'framer-motion'

export default function RankedGamePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [eloDelta, setEloDelta] = useState<number | null>(null)
  const [displayElo, setDisplayElo] = useState<number | null>(null)
  const processedRef = useRef(false)
  
  // Lock difficulty to medium
  const { state, elapsed, minesLeft, showProbs, probs, elapsedFormatted, reveal, flag, restart, toggleProbs } = useGame('medium', undefined, false)

  // Use `user` for login check, not `profile` — profile loads async and may be null initially
  const isLoggedIn = !!user

  // Keep display ELO in sync with profile
  useEffect(() => {
    if (profile) setDisplayElo(profile.elo_rating)
  }, [profile])

  useEffect(() => {
    async function updateElo() {
      if ((state.status === 'won' || state.status === 'lost') && !processedRef.current) {
        // Show overlay immediately
        if (eloDelta === null) {
          setEloDelta(state.status === 'won' ? 25 : -25)
        }

        // We need both user and profile to update ELO in DB
        if (!user || !profile) {
          console.log('Waiting for user/profile to sync with DB...', { user: !!user, profile: !!profile })
          return
        }
        
        processedRef.current = true
        console.log('--- ELO UPDATE START ---')
        
        const delta = state.status === 'won' ? 25 : -25
        setEloDelta(delta)
        
        const newElo = Math.max(0, (profile?.elo_rating || 1000) + delta)
        setDisplayElo(newElo) // Optimistic update
        
        try {
          console.log('Sending update to Supabase...', { id: user.id, newElo })
          const { error, data } = await supabase
            .from('profiles')
            .update({ 
              elo_rating: newElo,
              games_played: (profile?.games_played || 0) + 1,
              games_won: (profile?.games_won || 0) + (state.status === 'won' ? 1 : 0)
            })
            .eq('id', user.id)
            .select()
          
          if (error) {
            console.error('Supabase update error:', error)
            alert('Ошибка при обновлении рейтинга: ' + error.message)
          } else {
            console.log('Supabase update success:', data)
            await refreshProfile()
          }
        } catch (err) {
          console.error('Unexpected error during ELO update:', err)
        }
        console.log('--- ELO UPDATE END ---')
      }
    }
    updateElo()
  }, [state.status, profile, user, refreshProfile])

  const handleRestart = () => {
    processedRef.current = false
    setEloDelta(null)
    restart()
  }

  const currentElo = displayElo ?? profile?.elo_rating ?? 1000
  const tier = getEloTier(currentElo)

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-4xl text-foreground mb-2 flex items-center gap-3">
              <Trophy className="text-warn" />
              Ranked Match
            </h1>
            <p className="text-foreground/60 font-medium">Сложность заблокирована: Medium (16x16, 40 мин)</p>
          </div>
          
          <div className="flex items-center gap-4 bg-glass/5 backdrop-blur-md border border-glassborder/10 rounded-2xl px-5 py-3 shadow-lg">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mb-1">Рейтинг</span>
              <div className="flex items-center gap-2">
                <span className="text-xl" style={{ color: tier.color }}>{tier.emoji}</span>
                <span className="font-mono font-bold text-xl text-foreground">{currentElo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Warning */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-warn/10 border border-warn/20 rounded-xl text-warn text-sm font-bold flex items-center gap-3 animate-pulse shadow-lg">
            <TrendingDown size={20} />
            Ты не вошел в аккаунт! Твой рейтинг не будет сохраняться после игры.
          </div>
        )}

        {/* Main Glass Container */}
        <div className="rounded-[40px] bg-glass/5 backdrop-blur-3xl border border-glassborder/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-warn/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-liberty-purple/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <GameHUD
              minesLeft={minesLeft}
              elapsed={elapsedFormatted}
              status={state.status}
              showProbs={showProbs}
              onRestart={handleRestart}
              difficulty="medium"
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
                  cellSize={34}
                />
              </div>
            </div>

            <AnimatePresence>
              {(state.status === 'won' || state.status === 'lost') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[40px]"
                >
                  <div className={`p-8 rounded-[32px] border text-center shadow-2xl backdrop-blur-xl max-w-md w-full mx-4 ${
                    state.status === 'won' 
                      ? 'bg-safe/20 border-safe/30' 
                      : 'bg-liberty-red/20 border-liberty-red/30'
                  }`}>
                    <h3 className={`font-display font-black text-4xl mb-2 drop-shadow-md ${state.status === 'won' ? 'text-safe' : 'text-liberty-red'}`}>
                      {state.status === 'won' ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
                    </h3>
                    <p className="text-foreground/80 font-medium mb-6">
                      Время: <span className="font-mono font-bold text-foreground">{elapsedFormatted}</span>
                    </p>
                    
                    <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-2xl border border-glassborder/10 mb-8">
                      <div className="flex items-center gap-3 text-3xl font-black mb-2">
                        {state.status === 'won' ? <TrendingUp className="text-safe" size={32} /> : <TrendingDown className="text-liberty-red" size={32} />}
                        <span className={state.status === 'won' ? 'text-safe' : 'text-liberty-red'}>
                          {state.status === 'won' ? '+' : ''}{Math.abs(eloDelta || 0)} ELO
                        </span>
                      </div>
                      <p className="text-foreground/50 text-sm font-bold uppercase tracking-wider">
                        {eloDelta !== null ? `Новый рейтинг: ${currentElo}` : 'Обновление рейтинга...'}
                      </p>
                    </div>

                    <div className="flex gap-4 w-full">
                      <button onClick={handleRestart}
                        className="flex-1 py-4 rounded-xl bg-foreground text-background text-sm font-black hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Сыграть ещё
                      </button>
                      <button onClick={() => navigate('/modes')}
                        className="flex-1 py-4 rounded-xl bg-glass/10 text-foreground text-sm font-bold border border-glassborder/20 hover:bg-glass/20 transition-colors">
                        Выйти
                      </button>
                    </div>
                  </div>
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
