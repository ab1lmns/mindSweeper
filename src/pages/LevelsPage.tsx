import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Play } from 'lucide-react'
import { CAMPAIGN_LEVELS } from '@/types'
import { useState, useEffect } from 'react'

export default function LevelsPage() {
  const [unlocked, setUnlocked] = useState(1)

  useEffect(() => {
    const saved = localStorage.getItem('campaign_unlocked')
    if (saved) setUnlocked(parseInt(saved, 10))
  }, [])

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-to-br from-white to-white/50 text-transparent bg-clip-text">
            Campaign Mode
          </h1>
          <p className="text-muted text-lg max-w-lg mx-auto">
            Пройди 20 уровней постепенно возрастающей сложности. От новичка до легенды саперного дела.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {CAMPAIGN_LEVELS.map((level, i) => {
            const num = i + 1
            const isUnlocked = num <= unlocked
            const isCurrent = num === unlocked
            const isCompleted = num < unlocked

            return (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {isUnlocked ? (
                  <Link 
                    to={`/campaign/${num}`}
                    className={`block aspect-square rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group ${
                      isCurrent 
                        ? 'bg-primary/20 border-2 border-primary shadow-xl shadow-primary/20 text-foreground hover:scale-105'
                        : 'bg-surface border border-border text-foreground hover:bg-glass/5 hover:scale-105'
                    }`}
                  >
                    {/* Background glow for current level */}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-3xl font-display font-bold mb-2">{num}</span>
                      <span className="text-xs font-mono opacity-70 bg-black/20 px-2 py-1 rounded-md">
                        {level.width}x{level.height} • {level.mines}💣
                      </span>
                      {isCurrent && <Play size={20} className="mt-4 text-primary animate-pulse" fill="currentColor" />}
                      {isCompleted && <span className="mt-4 text-safe text-sm font-bold">Пройден</span>}
                    </div>
                  </Link>
                ) : (
                  <div className="aspect-square rounded-3xl p-4 flex flex-col items-center justify-center text-center bg-card/30 border border-border/30 text-muted/50">
                    <Lock size={24} className="mb-2" />
                    <span className="text-xl font-display font-bold">{num}</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
