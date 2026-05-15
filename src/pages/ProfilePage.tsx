import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, Target, Flame, Crown, LogOut, MapPin, Edit2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getEloTier, ACHIEVEMENTS } from '@/types'
import { formatTime } from '@/lib/gameEngine'

const UNLOCKED_MOCK = ['first_win', 'speed_demon', 'century']

export default function ProfilePage() {
  const { user, profile, loading, signOut, setNeedsUsername } = useAuth()
  const navigate = useNavigate()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-liberty-blue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(41,114,245,0.5)]" />
    </div>
  )

  if (!user) {
    navigate('/login')
    return null
  }

  // Use profile data or sensible defaults
  const username = profile?.username || user.email?.split('@')[0] || 'Player'
  const eloRating = profile?.elo_rating ?? 1000
  const gamesPlayed = profile?.games_played ?? 0
  const gamesWon = profile?.games_won ?? 0
  const currentStreak = profile?.current_streak ?? 0
  const bestTimeHard = profile?.best_time_hard ?? null
  const bestTimeEasy = profile?.best_time_easy ?? null
  const bestTimeMedium = profile?.best_time_medium ?? null
  const isPro = profile?.is_pro ?? false
  const city = profile?.city || '—'
  const country = profile?.country || '—'

  const tier = getEloTier(eloRating)
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">
      {/* Header Container */}
      <div className="rounded-[32px] bg-glass/5 backdrop-blur-2xl border border-glassborder/10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-liberty-purple blur-[100px] rounded-full opacity-30 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[32px] bg-glass/10 border border-glassborder/20 flex items-center justify-center text-4xl font-black text-foreground shadow-xl backdrop-blur-md">
            {username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1 group">
              <h1 className="font-display font-black text-4xl text-foreground tracking-tight">{username}</h1>
              <button 
                onClick={() => setNeedsUsername(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-foreground/40 hover:text-primary rounded-xl hover:bg-primary/10"
                title="Сменить никнейм"
              >
                <Edit2 size={18} />
              </button>
              {isPro && (
                <span className="text-xs px-3 py-1 rounded-full bg-liberty-red/20 text-liberty-red border border-liberty-red/30 font-black flex items-center gap-1 shadow-[0_0_10px_rgba(249,95,95,0.3)]">
                  <Crown size={12} /> PRO
                </span>
              )}
            </div>
            <p className="text-foreground/60 font-medium mb-3 flex items-center gap-2">
              <MapPin size={14} /> {city}, {country}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-xl drop-shadow-md" style={{ color: tier.color }}>
                {eloRating} ELO
              </span>
              <span className="text-xs px-3 py-1 rounded-full border font-bold shadow-sm backdrop-blur-sm"
                style={{ color: tier.color, borderColor: tier.color + '40', background: tier.color + '15' }}>
                {tier.emoji} {tier.name}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut().then(() => navigate('/'))}
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glassborder/10 bg-glass/5 text-sm font-bold text-foreground/70 hover:text-foreground hover:bg-glass/10 hover:border-glassborder/20 transition-all shadow-sm">
          <LogOut size={16} /> Выйти
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Win Rate',    value: `${winRate}%`,          color: 'text-safe',        bg: 'bg-safe/10',        border: 'border-safe/20' },
          { icon: Trophy, label: 'Игр сыграно', value: gamesPlayed,            color: 'text-liberty-blue', bg: 'bg-liberty-blue/10', border: 'border-liberty-blue/20' },
          { icon: Flame,  label: 'Серия',       value: `${currentStreak} 🔥`, color: 'text-warn',        bg: 'bg-warn/10',        border: 'border-warn/20' },
          { icon: Zap,    label: 'Hard рекорд', value: bestTimeHard ? formatTime(bestTimeHard) : '—', color: 'text-liberty-red', bg: 'bg-liberty-red/10', border: 'border-liberty-red/20' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`p-6 rounded-[24px] ${bg} border ${border} backdrop-blur-xl shadow-lg relative overflow-hidden group`}>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl ${bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <Icon size={20} className={`${color} mb-3 relative z-10 drop-shadow-sm`} />
            <p className={`text-3xl font-black font-display ${color} relative z-10 drop-shadow-md tracking-tight`}>{value}</p>
            <p className="text-sm text-foreground/60 font-bold mt-1 relative z-10 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Best times */}
        <div className="md:col-span-1 p-8 rounded-[32px] bg-glass/5 backdrop-blur-2xl border border-glassborder/10 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-warn/20 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="font-display font-black text-xl mb-6 flex items-center gap-3 text-foreground relative z-10">
            <Zap size={20} className="text-warn drop-shadow-sm" /> Лучшее время
          </h2>
          <div className="flex flex-col gap-3 relative z-10">
            {[
              { label: 'Easy',   time: bestTimeEasy   },
              { label: 'Medium', time: bestTimeMedium  },
              { label: 'Hard',   time: bestTimeHard    },
            ].map(({ label, time }) => (
              <div key={label} className="flex items-center justify-between p-4 rounded-2xl bg-glass/5 border border-glassborder/10">
                <p className="text-sm font-bold text-foreground/60">{label}</p>
                <p className="font-mono font-bold text-lg text-foreground drop-shadow-md">{time ? formatTime(time) : '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="md:col-span-2 p-8 rounded-[32px] bg-glass/5 backdrop-blur-2xl border border-glassborder/10 shadow-xl relative overflow-hidden">
          <h2 className="font-display font-black text-xl mb-6 flex items-center gap-3 text-foreground relative z-10">
            <Trophy size={20} className="text-warn drop-shadow-sm" /> Достижения
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = UNLOCKED_MOCK.includes(ach.key)
              return (
                <div key={ach.key}
                  className={`p-4 rounded-2xl border transition-all ${unlocked ? 'bg-glass/10 border-glassborder/20 shadow-lg' : 'bg-glass/5 border-glassborder/5 opacity-40 grayscale'}`}>
                  <span className="text-3xl block mb-3 drop-shadow-md">{ach.icon}</span>
                  <p className="text-sm font-black text-foreground leading-tight mb-1">{ach.title}</p>
                  <p className="text-[11px] text-foreground/60 font-medium leading-tight mb-3">{ach.desc}</p>
                  <span className={`text-[10px] inline-block px-2 py-1 rounded-full font-black uppercase tracking-wider ${
                    ach.rarity === 'legendary' ? 'bg-liberty-red/20 text-liberty-red border border-liberty-red/30' :
                    ach.rarity === 'epic'      ? 'bg-liberty-purple/20 text-liberty-purple border border-liberty-purple/30' :
                    ach.rarity === 'rare'      ? 'bg-liberty-blue/20 text-liberty-blue border border-liberty-blue/30' :
                    'bg-glass/10 text-foreground/70 border border-glassborder/20'
                  }`}>{ach.rarity}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
