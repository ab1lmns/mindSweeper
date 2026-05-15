import { Crown, Check, Brain, Zap, BarChart2, Palette, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

const PRO_FEATURES = [
  { icon: Zap,       text: 'Безлимитные игры (Free: 10/день)' },
  { icon: Brain,     text: 'AI Coach — полный разбор каждой игры' },
  { icon: BarChart2, text: 'Полная аналитика и реплеи' },
  { icon: Trophy,    text: 'Все турниры без ограничений' },
  { icon: Palette,   text: 'Кастомные темы (Neon, Retro, Forest...)' },
  { icon: Crown,     text: 'Pro бейдж в профиле и лидерборде' },
]

export default function ProPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-4">
          <Crown size={14} /> MindSweeper Pro
        </div>
        <h1 className="font-display font-bold text-4xl mb-3">Стань лучше. Быстрее.</h1>
        <p className="text-muted">AI-коуч, безлимит и полная аналитика</p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {/* Free */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-display font-bold text-xl mb-1">Free</h2>
          <p className="text-4xl font-display font-bold mb-5">$0</p>
          {['10 игр в день', 'Easy / Medium / Hard', 'Daily Challenge', 'Базовая статистика', 'Глобальный лидерборд'].map(f => (
            <div key={f} className="flex items-center gap-2 mb-2.5 text-sm text-muted">
              <Check size={13} className="shrink-0 text-muted" />{f}
            </div>
          ))}
          <div className="mt-4 py-2.5 rounded-xl border border-border text-center text-sm text-muted cursor-default">
            Текущий план
          </div>
        </div>

        {/* Pro */}
        <div className="p-6 rounded-2xl border-2 border-accent bg-accent/5 relative">
          <div className="absolute -top-3 left-6">
            <span className="px-3 py-1 rounded-full bg-accent text-foreground text-xs font-bold">ПОПУЛЯРНЫЙ</span>
          </div>
          <h2 className="font-display font-bold text-xl mb-1 text-accent">Pro</h2>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-display font-bold">$4.99</p>
            <span className="text-muted text-sm">/месяц</span>
          </div>
          <p className="text-xs text-muted mb-5">или $39.99/год — экономия 33%</p>
          {PRO_FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 mb-2.5 text-sm">
              <Icon size={13} className="shrink-0 text-accent" />{text}
            </div>
          ))}
          <button className="mt-4 w-full py-2.5 rounded-xl bg-accent text-foreground font-bold text-sm hover:bg-accent/80 transition-all">
            Upgrade to Pro →
          </button>
          <p className="text-xs text-muted text-center mt-2">Отмена в любой момент</p>
        </div>
      </div>

      {/* Comparison */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-3 bg-card text-xs text-muted font-semibold px-4 py-3 border-b border-border">
          <span>Функция</span><span className="text-center">Free</span><span className="text-center text-accent">Pro</span>
        </div>
        {[
          ['Игры в день', '10', '∞'],
          ['AI подсказки', '3/день', '∞'],
          ['Разбор игры AI', '❌', '✅'],
          ['Реплеи', '5 последних', 'все'],
          ['Кастомные темы', '❌', '✅'],
          ['Турниры', '❌', '✅'],
          ['1v1 Дуэли', '3/день', '∞'],
        ].map(([f, fr, pr]) => (
          <div key={f} className="grid grid-cols-3 px-4 py-3 border-b border-border/40 text-sm">
            <span className="text-muted">{f}</span>
            <span className="text-center text-muted">{fr}</span>
            <span className="text-center text-safe font-medium">{pr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
