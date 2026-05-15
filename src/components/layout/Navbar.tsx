import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bomb, Menu, X, Crown, LogOut, User, Swords, Trophy, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getEloTier } from '@/types'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark'
  )

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const tier = profile ? getEloTier(profile.elo_rating) : null

  // Links only for logged-in users
  const links = user ? [
    { to: '/modes',       label: 'Режимы',  icon: Swords },
    { to: '/leaderboard', label: 'Рейтинг', icon: Trophy },
    { to: '/profile',     label: 'Профиль', icon: User },
  ] : []

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-glass/5 backdrop-blur-2xl border-b border-glassborder/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? '/modes' : '/'} className="flex items-center gap-2 font-display font-bold text-2xl tracking-wide text-foreground">
          <Bomb size={24} className="text-liberty-red" />
          Mind<span className="text-liberty-red">Sweeper</span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive(l.to) 
                    ? 'text-foreground bg-glass/10 shadow-sm border border-glassborder/5' 
                    : 'text-foreground/60 hover:text-foreground hover:bg-glass/10'
                }`}>
                <l.icon size={16} className={isActive(l.to) ? 'text-liberty-blue' : 'text-foreground/50'} />
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-glass/5 border border-glassborder/10 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-glass/10 transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {user && profile ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-glass/10 border border-glassborder/10 backdrop-blur-md">
                <div className="w-7 h-7 rounded-full bg-liberty-blue flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight text-foreground">{profile.username}</span>
                  {tier && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.emoji} {profile.elo_rating}</span>}
                </div>
              </div>
              <button onClick={() => signOut().then(() => navigate('/'))}
                className="w-10 h-10 rounded-xl bg-glass/5 border border-glassborder/10 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-glass/10 transition-all shadow-sm" title="Выйти">
                <LogOut size={18} />
              </button>
            </div>
          ) : !user ? (
            <Link to="/login"
              className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-glass/20">
              Войти
            </Link>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-glass/5 border border-glassborder/10 flex items-center justify-center text-foreground/80 hover:bg-glass/10 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="w-10 h-10 rounded-xl bg-glass/5 border border-glassborder/10 flex items-center justify-center text-foreground/80 hover:bg-glass/10 transition-colors"
            onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-glassborder/10 bg-background/90 backdrop-blur-3xl px-4 py-4 space-y-2 animate-slide-up shadow-2xl">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive(l.to) ? 'bg-glass/10 text-foreground font-bold border border-glassborder/10' : 'text-foreground/70 hover:bg-glass/10'
              }`}>
              <l.icon size={18} className={isActive(l.to) ? 'text-liberty-blue' : 'text-foreground/50'} />
              {l.label}
            </Link>
          ))}
          {user && profile && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-glass/10 border border-glassborder/10 mt-4">
              <div className="w-8 h-8 rounded-full bg-liberty-blue flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{profile.username}</span>
                {tier && <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.emoji} {profile.elo_rating} ELO</span>}
              </div>
            </div>
          )}
          {user
            ? <button onClick={() => { signOut(); setOpen(false) }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl text-sm font-bold text-liberty-red hover:bg-glass/10 transition-colors mt-2">
                <LogOut size={18} /> Выйти
              </button>
            : <Link to="/login" onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold bg-foreground text-background text-center mt-2">
                Войти
              </Link>
          }
        </div>
      )}
    </nav>
  )
}
