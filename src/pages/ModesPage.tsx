import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Brain, Swords, Trophy, ChevronRight, Zap, BrainCircuit, Star } from 'lucide-react'

const MODES = [
  {
    id: 'daily',
    title: 'Daily Challenge',
    desc: 'Одно поле для всех на сегодня. Заверши быстрее остальных, чтобы заработать ELO и попасть в топ рейтинга.',
    icon: Calendar,
    color: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/20',
    hover: 'hover:border-warn/50',
    link: '/daily',
    badge: '🏆 Дает ELO',
    status: 'active'
  },
  {
    id: 'academy',
    title: 'AI Academy',
    desc: 'Обучающий режим. ИИ-тренер следит за твоими ходами, объясняет логику и дает подсказки в реальном времени.',
    icon: BrainCircuit,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    hover: 'hover:border-primary/50',
    link: '/play',
    badge: '🧠 ОБУЧЕНИЕ',
    status: 'active'
  },
  {
    id: 'rush',
    title: '2 Minute Rush',
    desc: '2 минуты. Бесконечные поля. Комбо за скорость. Ошибки отнимают время. Максимум адреналина.',
    icon: Zap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    hover: 'hover:border-accent/50',
    link: '/rush',
    badge: '🔥 НОВОЕ',
    status: 'active'
  },
  {
    id: 'ranked',
    title: 'Ranked Сезоны',
    desc: 'Твой путь в киберспорт. Зарабатывай ELO, поднимай дивизионы от Бронзы до Легенды и отслеживай свой прогресс.',
    icon: Trophy,
    color: 'text-[#ffd700]',
    bg: 'bg-[#ffd700]/10',
    border: 'border-[#ffd700]/20',
    hover: 'hover:border-[#ffd700]/50',
    link: '/ranked',
    badge: '👑 ЛИГИ',
    status: 'active'
  }
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function ModesPage() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight mb-4 text-foreground">
          Выбери свой <span className="text-liberty-blue drop-shadow-[0_0_15px_rgba(41,114,245,0.5)]">Режим</span>
        </h1>
        <p className="text-foreground/60 text-xl font-medium">
          Зарабатывай ELO в Ranked или тренируйся с AI.
        </p>
      </div>

      <motion.div 
        variants={container} initial="hidden" animate="show"
        className="grid md:grid-cols-2 gap-6"
      >
        {MODES.map(mode => (
          <motion.div key={mode.id} variants={item}>
            <Link to={mode.link}
              className={`block h-full p-8 rounded-[32px] bg-glass/5 backdrop-blur-xl border border-glassborder/10 hover:bg-glass/10 hover:border-glassborder/20 transition-all duration-300 group relative overflow-hidden shadow-lg`}
              style={mode.status === 'soon' ? { pointerEvents: 'none', opacity: 0.7 } : {}}
            >
              {/* Highlight gradient */}
              <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${mode.bg} flex items-center justify-center shadow-lg border ${mode.border}`}>
                  <mode.icon size={28} className={mode.color} />
                </div>
                {mode.badge && (
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${mode.bg} ${mode.color} border ${mode.border} shadow-sm`}>
                    {mode.badge}
                  </span>
                )}
                {mode.status === 'soon' && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-glass/5 text-foreground/50 border border-glassborder/10">
                    Скоро
                  </span>
                )}
              </div>

              <h2 className="font-display font-bold text-3xl mb-3 relative z-10 text-foreground">{mode.title}</h2>
              <p className="text-foreground/60 text-base leading-relaxed mb-8 relative z-10 font-medium">
                {mode.desc}
              </p>

              {mode.status === 'active' && (
                <div className="flex items-center gap-2 text-sm font-bold text-foreground/60 group-hover:text-foreground transition-colors relative z-10 mt-auto">
                  Играть <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Play Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-8 p-10 md:p-12 rounded-[40px] bg-glass/10 backdrop-blur-2xl border border-glassborder/20 text-center relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-liberty-blue/30 blur-[100px] rounded-full group-hover:bg-liberty-blue/40 transition-colors duration-700 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-liberty-purple/30 blur-[100px] rounded-full group-hover:bg-liberty-purple/40 transition-colors duration-700 pointer-events-none" />
        <div className="relative z-10">
          <Star size={48} className="text-foreground mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          <h3 className="font-display font-black text-4xl md:text-5xl mb-4 text-foreground tracking-tight">
            Сюжетная Кампания
          </h3>
          <p className="text-foreground/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium">
            Пройди 20 уникальных уровней: от разминки 5x5 до безумных минных полей. Идеально для новичков и профи.
          </p>
          <Link to="/levels" className="inline-block px-10 py-4 rounded-2xl bg-foreground text-background font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Начать прохождение
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
