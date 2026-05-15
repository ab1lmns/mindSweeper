import { useState, useEffect } from 'react'
import { Trophy, Globe, MapPin, Users, Shield, TrendingUp, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getEloTier, ELO_TIERS } from '@/types'
import { motion } from 'framer-motion'

interface RankedProfile {
  id: string
  username: string
  elo_rating: number
  city: string
  games_played: number
  games_won: number
  best_time_hard: number | null
}

const tabs = [
  { label: 'Глобальный', icon: Globe  },
  { label: 'Казахстан',  icon: MapPin },
  { label: 'Друзья',     icon: Users  },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="text-xs font-mono text-muted">{rank}</span>
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState(0)
  const [profiles, setProfiles] = useState<RankedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()

  useEffect(() => {
    setLoading(true)
    supabase
      .from('profiles')
      .select('id, username, elo_rating, city, games_played, games_won, best_time_hard')
      .order('elo_rating', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setProfiles(data as RankedProfile[])
        setLoading(false)
      })
  }, [profile?.elo_rating])

  const currentTier = profile ? getEloTier(profile.elo_rating) : null
  const nextTier = profile ? ELO_TIERS.find(t => t.min > (profile.elo_rating || 0)) : null
  const progressPercent = profile && nextTier && currentTier
    ? ((profile.elo_rating - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">
      
      {/* Header & Season Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-primary" />
            <h1 className="font-display font-bold text-4xl">Ranked Mode</h1>
          </div>
          <p className="text-muted text-sm">Соревнуйся с лучшими. Поднимай дивизионы.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-xl">
          <Sparkles size={16} className="text-warn" />
          <div>
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Текущий сезон</p>
            <p className="text-sm font-semibold text-foreground">Сезон 1: Genesis</p>
          </div>
          <div className="ml-4 pl-4 border-l border-border">
            <p className="text-xs text-muted font-bold uppercase tracking-wider">Конец через</p>
            <p className="text-sm font-mono text-warn">30 дней</p>
          </div>
        </div>
      </div>

      {/* Current Player Dashboard Card */}
      {profile && currentTier && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full relative rounded-3xl border border-border overflow-hidden mb-12 p-8 flex flex-col md:flex-row items-center gap-8"
          style={{ background: `linear-gradient(135deg, ${currentTier.color}15 0%, transparent 100%)`, borderColor: `${currentTier.color}40` }}
        >
          {/* Glowing orb behind the emoji */}
          <div className="absolute top-1/2 left-12 -translate-y-1/2 w-32 h-32 blur-[60px] opacity-40" style={{ backgroundColor: currentTier.color }} />
          
          <div className="relative text-7xl drop-shadow-2xl filter hover:scale-110 transition-transform cursor-default">
            {currentTier.emoji}
          </div>

          <div className="flex-1 w-full relative z-10">
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Твой Дивизион</h2>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display font-bold text-4xl leading-none" style={{ color: currentTier.color }}>
                {currentTier.name}
              </span>
              <span className="font-mono text-xl text-foreground/80 font-semibold mb-0.5">{profile.elo_rating} ELO</span>
            </div>

            {nextTier ? (
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span style={{ color: currentTier.color }}>{currentTier.name}</span>
                  <span className="text-muted">Осталось {nextTier.min - profile.elo_rating} pts до {nextTier.name}</span>
                  <span style={{ color: nextTier.color }}>{nextTier.name} ({nextTier.min})</span>
                </div>
                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-glassborder/5">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold mb-2 text-safe">Максимальный ранг достигнут!</div>
                <div className="h-3 w-full bg-safe/20 rounded-full overflow-hidden border border-glassborder/5">
                  <div className="h-full w-full bg-safe rounded-full" />
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col gap-3 pl-8 border-l border-glassborder/10 relative z-10">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-bold">Винрейт</p>
              <p className="text-lg font-mono font-semibold text-safe">
                {profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-bold">Игр сыграно</p>
              <p className="text-lg font-mono font-semibold text-foreground">{profile.games_played}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map(({ label, icon: Icon }, i) => (
          <button key={label} onClick={() => setTab(i)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              i === tab ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground hover:border-glassborder/20'
            }`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-border">
              <th className="text-center px-4 py-4 w-12 font-bold">#</th>
              <th className="text-left px-4 py-4 font-bold">Игрок</th>
              <th className="text-right px-4 py-4 font-bold">Рейтинг ELO</th>
              <th className="text-right px-4 py-4 hidden sm:table-cell font-bold">Win Rate</th>
              <th className="text-right px-4 py-4 hidden md:table-cell font-bold">Игры</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  <div className="flex justify-center mb-2"><TrendingUp size={24} className="animate-pulse" /></div>
                  Загрузка рейтинга...
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  Рейтинг пока пуст. Сыграй первую игру!
                </td>
              </tr>
            ) : profiles.map((p, index) => {
              const rank = index + 1
              const tier = getEloTier(p.elo_rating)
              const winRate = p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0
              const isMe = profile?.id === p.id

              return (
                <tr key={p.id} className={`border-b border-border/40 transition-colors ${isMe ? 'bg-primary/10' : 'hover:bg-surface/50'}`}>
                  <td className="px-4 py-4 text-center"><RankIcon rank={rank} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ backgroundColor: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}>
                        {p.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isMe ? 'text-primary' : 'text-foreground'}`}>
                          {p.username} {isMe && <span className="text-[10px] ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded">ВЫ</span>}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <span style={{color: tier.color}}>{tier.emoji} {tier.name}</span> • {p.city || 'Неизвестно'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-mono font-bold text-base" style={{ color: tier.color }}>{p.elo_rating}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden sm:table-cell font-mono text-sm">
                    <span className={winRate >= 60 ? 'text-safe' : winRate >= 40 ? 'text-foreground' : 'text-accent'}>{winRate}%</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell text-muted font-mono text-sm">{p.games_played}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* User Rank Fallback */}
      {user && profile && !profiles.find(p => p.id === user.id) && (
        <div className="mt-4 rounded-2xl border border-primary/30 overflow-hidden bg-primary/5 shadow-lg">
          <table className="w-full text-sm">
            <tbody>
              <tr className="bg-primary/10">
                <td className="px-4 py-4 text-center w-12 text-muted italic">?</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary/20 text-primary border border-primary/40">
                      {profile.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">
                        {profile.username} <span className="text-[10px] ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded">ВЫ (вне топ-100)</span>
                      </p>
                      <p className="text-xs text-muted">Сыграй больше игр, чтобы подняться выше!</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono font-bold text-base text-primary">{profile.elo_rating}</span>
                </td>
                <td className="px-4 py-4 text-right hidden sm:table-cell font-mono text-sm">
                  {profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0}%
                </td>
                <td className="px-4 py-4 text-right hidden md:table-cell text-muted font-mono text-sm">{profile.games_played}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!user && (
        <p className="text-center text-sm font-medium text-muted mt-8">
          Войди в аккаунт, чтобы попасть в рейтинг и начать поднимать дивизионы.
        </p>
      )}

      {user && !profile && (
        <div className="text-center mt-8">
          <p className="text-sm text-muted mb-4">Твой профиль еще не синхронизирован с базой рейтинга.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-bold text-sm"
          >
            Синхронизировать сейчас
          </button>
        </div>
      )}
    </div>
  )
}
