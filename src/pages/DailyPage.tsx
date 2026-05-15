import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Share2, Trophy } from 'lucide-react'
import { useGame } from '@/hooks/useGame'
import { getDailySeed, formatTime } from '@/lib/gameEngine'
import GameBoard from '@/components/game/GameBoard'
import GameHUD from '@/components/game/GameHUD'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface DailyLeader {
  id: string
  time_seconds: number
  profiles: {
    username: string
    city: string
  }
}

export default function DailyPage() {
  const { user } = useAuth()
  const today = new Date()
  const seed = getDailySeed()
  const dayNum = Math.floor((today.getTime() - new Date('2024-01-01').getTime()) / 86400000)
  // Format as YYYY-MM-DD in local time
  const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  
  const { state, elapsed, minesLeft, showProbs, probs, elapsedFormatted, reveal, flag, toggleProbs } = useGame('medium', seed)
  const [shared, setShared] = useState(false)
  const [leaders, setLeaders] = useState<DailyLeader[]>([])
  const processedRef = useRef(false)

  useEffect(() => {
    async function loadLeaders() {
      const { data } = await supabase
        .from('daily_results')
        .select('id, time_seconds, profiles(username, city)')
        .eq('date', todayStr)
        .eq('result', 'win')
        .order('time_seconds', { ascending: true })
        .limit(10)
      
      if (data) setLeaders(data as unknown as DailyLeader[])
    }
    loadLeaders()
  }, [todayStr])

  useEffect(() => {
    async function saveResult() {
      if ((state.status === 'won' || state.status === 'lost') && !processedRef.current && user) {
        processedRef.current = true
        
        await supabase.from('daily_results').upsert({
          date: todayStr,
          user_id: user.id,
          time_seconds: state.status === 'won' ? elapsed : null,
          result: state.status
        }, { onConflict: 'date, user_id' })
        
        // Refresh board
        const { data } = await supabase
          .from('daily_results')
          .select('id, time_seconds, profiles(username, city)')
          .eq('date', todayStr)
          .eq('result', 'win')
          .order('time_seconds', { ascending: true })
          .limit(10)
        
        if (data) setLeaders(data as unknown as DailyLeader[])
      }
    }
    saveResult()
  }, [state.status, user, elapsed, todayStr])

  const share = () => {
    const emoji = state.status === 'won' ? '✅' : state.status === 'lost' ? '❌' : '🕐'
    const text = `MindSweeper Daily #${dayNum} ${emoji}\n⏱ ${elapsedFormatted}\nmindsweeper.app/daily`
    navigator.clipboard.writeText(text)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
      {/* Game */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-warn" />
              <h1 className="font-display font-bold text-xl">Daily Challenge</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-warn/15 text-warn border border-warn/20">
                #{dayNum}
              </span>
            </div>
            <span className="text-xs text-muted">
              {today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">Одно поле для всех. Одна попытка.</p>
        </div>

        <GameHUD
          minesLeft={minesLeft}
          elapsed={elapsedFormatted}
          status={state.status}
          showProbs={showProbs}
          onRestart={() => {}}
          onToggleProbs={toggleProbs}
          difficulty="medium"
          noRestart
        />

        <div className="overflow-auto">
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

        <AnimatePresence>
          {(state.status === 'won' || state.status === 'lost') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-col items-center gap-3">
              <p className={`text-sm font-medium ${state.status === 'won' ? 'text-safe' : 'text-accent'}`}>
                {state.status === 'won' ? `🎉 Разминировано за ${elapsedFormatted}!` : '💥 Попал на мину!'}
              </p>
              <button onClick={share}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-foreground text-sm font-semibold hover:bg-primary/80 transition-all">
                <Share2 size={13} />
                {shared ? 'Скопировано!' : 'Поделиться результатом'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leaderboard */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-card border border-border rounded-2xl p-4 sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={15} className="text-warn" />
            <h2 className="font-display font-semibold">Топ сегодня</h2>
          </div>
          <div className="space-y-2">
            {leaders.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Пока никто не решил. Стань первым!</p>
            ) : leaders.map((e, index) => {
              const rank = index + 1
              return (
                <div key={e.id} className={`flex items-center gap-3 p-2 rounded-xl ${rank <= 3 ? 'bg-warn/5 border border-warn/10' : ''}`}>
                  <span className={`text-sm font-bold w-5 shrink-0 text-center ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-muted'}`}>
                    {rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.profiles?.username || 'Неизвестно'}</p>
                    <p className="text-[10px] text-muted">{e.profiles?.city || '—'}</p>
                  </div>
                  <span className="text-xs font-mono text-safe shrink-0">{formatTime(e.time_seconds)}</span>
                </div>
              )
            })}
          </div>
          {!user && (
            <p className="text-xs text-muted text-center mt-4 border-t border-border pt-4">Войди, чтобы попасть в рейтинг</p>
          )}
        </div>
      </div>
    </div>
  )
}
