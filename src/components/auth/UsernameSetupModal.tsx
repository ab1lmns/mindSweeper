import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Bomb, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UsernameSetupModal() {
  const { needsUsername, setUsername } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!needsUsername) return null

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Введи имя'); return }
    setLoading(true)
    const err = await setUsername(name.trim())
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-surface border border-border rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Bomb size={32} className="text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Добро пожаловать!</h2>
          <p className="text-muted text-sm">Выбери себе уникальный никнейм для лидерборда</p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Твой никнейм"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-center text-lg font-bold placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted text-center mt-2">3–20 символов. Буквы, цифры, подчеркивание.</p>
          </div>

          {error && (
            <p className="text-accent text-xs text-center bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || name.trim().length < 3}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/80 disabled:opacity-40 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {loading ? 'Сохраняю...' : 'Начать играть'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
