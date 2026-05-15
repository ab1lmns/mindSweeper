import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bomb, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    let err: string | null = null
    if (mode === 'login') {
      err = await signInWithEmail(email, password)
    } else {
      if (!username.trim()) { setError('Введи имя пользователя'); setLoading(false); return }
      if (username.length < 3) { setError('Минимум 3 символа'); setLoading(false); return }
      err = await signUpWithEmail(email, password, username.trim())
    }
    if (err) setError(err)
    else navigate('/modes')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Background aurora effects specifically for login */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-liberty-purple opacity-30 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-liberty-blue opacity-30 blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-sm rounded-[32px] bg-glass/5 backdrop-blur-2xl border border-glassborder/10 p-8 shadow-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-glass/10 border border-glassborder/20 mb-4 shadow-lg">
            <Bomb size={32} className="text-liberty-red" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {mode === 'login' ? 'С возвращением' : 'Создать профиль'}
          </h1>
          <p className="text-sm text-foreground/60 font-medium">MindSweeper Dashboard</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-glassborder/10 bg-glass/10 hover:bg-glass/20 transition-all text-sm font-bold mb-6 text-foreground shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Продолжить через Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-glass/10" />
          <span className="text-xs text-foreground/40 uppercase tracking-wider font-bold">или</span>
          <div className="flex-1 h-px bg-glass/10" />
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === 'signup' && (
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-glassborder/10 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-liberty-blue focus:bg-black/30 transition-all font-medium" />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-glassborder/10 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-liberty-blue focus:bg-black/30 transition-all font-medium" />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Пароль"
              className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-glassborder/10 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-liberty-blue focus:bg-black/30 transition-all font-medium pr-10" />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-liberty-red text-sm font-medium text-center bg-liberty-red/10 border border-liberty-red/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-foreground text-background font-black text-sm hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2">
            {loading ? '...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-foreground/60 mt-8 font-medium">
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-foreground hover:underline font-bold">
            {mode === 'login' ? 'Создать' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  )
}
