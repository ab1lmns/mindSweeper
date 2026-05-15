import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bomb, Trophy, Brain, Target, Play, Star, Sparkles, RefreshCcw, ArrowRight } from 'lucide-react'
import { useGame } from '@/hooks/useGame'
import GameBoard from '@/components/game/GameBoard'

export default function HomePage() {
  const { state, elapsedFormatted, minesLeft, reveal, flag, restart } = useGame('easy')

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 overflow-hidden">
      
      {/* Background aurora effects (in addition to global body gradient) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-[#f95f5f] opacity-20 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#2972f5] opacity-30 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-[1300px] mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Hero / Graphic Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-[40px] border border-glassborder/10 bg-glass/5 backdrop-blur-2xl p-8 lg:p-12 flex flex-col relative overflow-hidden"
            style={{ minHeight: '500px' }}
          >
            {/* Radar / Wave graphic mock */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-full h-full max-w-[500px] text-liberty-red/50">
                <path d="M200 20 C280 40, 360 80, 380 200 C390 300, 320 360, 200 380 C80 390, 20 320, 20 200 C10 80, 100 30, 200 20 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
                <path d="M200 60 C260 80, 320 120, 340 200 C350 280, 280 320, 200 340 C120 350, 60 280, 60 200 C50 120, 140 70, 200 60 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-liberty-red" />
              </svg>
              <div className="absolute font-black text-8xl md:text-[140px] text-foreground/10 select-none">MIND</div>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center shadow-2xl mb-6">
                <Bomb size={36} className="text-[#4f25a6]" />
              </div>
              <h1 className="font-display font-black text-5xl md:text-7xl leading-none mb-4">
                Сапёр<br />Новой Эры
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-md mb-8">
                Никаких случайностей. Играй турниры на ELO, проходи кампанию и прокачивай логику с AI.
              </p>
              <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-liberty-red text-foreground font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-liberty-red/30">
                <Play fill="currentColor" size={18} />
                Начать играть
              </Link>
            </div>
          </motion.div>

          {/* Right Stats Area */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Title / User Block */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-foreground/60 font-medium tracking-wide uppercase mb-1">Глобальная платформа</p>
                <h2 className="font-display font-bold text-4xl">MindSweeper</h2>
              </div>
              <div className="w-14 h-14 rounded-full bg-glass/10 backdrop-blur-md border border-glassborder/20 flex items-center justify-center shadow-lg">
                <Target size={24} className="text-foreground" />
              </div>
            </motion.div>

            {/* 3 Accent Cards (Red, Purple, White) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-3 md:gap-4"
            >
              {/* Red Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#ff6b6b] to-[#dc2626] p-4 flex flex-col items-center justify-center text-center shadow-lg shadow-red-500/20">
                <div className="w-10 h-10 rounded-full border border-glassborder/30 flex items-center justify-center mb-3">
                  <Trophy size={20} className="text-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground/90 mb-1">ELO Рейтинг</p>
                <p className="text-3xl font-bold">1v1</p>
              </div>

              {/* Purple/Glass Card */}
              <div className="rounded-3xl bg-glass/10 backdrop-blur-xl border border-glassborder/20 p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-glass/10 flex items-center justify-center mb-3">
                  <Star size={20} className="text-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground/60 mb-1">Кампания</p>
                <p className="text-3xl font-bold text-foreground">20</p>
              </div>

              {/* White Card */}
              <div className="rounded-3xl bg-foreground p-4 flex flex-col items-center justify-center text-center shadow-xl">
                <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center mb-3">
                  <Brain size={20} className="text-background" />
                </div>
                <p className="text-xs font-medium text-background/60 mb-1">AI Coach</p>
                <p className="text-3xl font-bold text-background">100%</p>
              </div>
            </motion.div>

            {/* Additional Info Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 gap-4 mt-auto"
            >
              <div className="rounded-2xl bg-glass/5 backdrop-blur-lg border border-glassborder/10 p-5 flex flex-col items-center text-center">
                <p className="text-xs text-foreground/60 mb-1 uppercase tracking-widest">Игроков</p>
                <p className="text-2xl font-bold">12,450+</p>
              </div>
              <div className="rounded-2xl bg-glass/5 backdrop-blur-lg border border-glassborder/10 p-5 flex flex-col items-center text-center">
                <p className="text-xs text-foreground/60 mb-1 uppercase tracking-widest">Сыграно Игр</p>
                <p className="text-2xl font-bold">284,192</p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Section: Platform Info & Mini Game */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          
          {/* Left: Platform Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-[32px] bg-glass/5 backdrop-blur-xl border border-glassborder/10 p-8 flex flex-col justify-center"
          >
            <h3 className="font-display font-bold text-3xl mb-6 flex items-center gap-3">
              <Sparkles className="text-liberty-blue" /> Больше, чем Сапёр
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">Zero-Guessing Engine</h4>
                <p className="text-foreground/70">Мы написали алгоритм, который гарантирует: любое сгенерированное поле можно решить чистой логикой. Больше никаких поражений из-за неудачного клика в ситуации 50/50.</p>
              </div>
              <div className="w-full h-[1px] bg-glass/10" />
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">От Бронзы до Легенды</h4>
                <p className="text-foreground/70">Играй в соревновательном режиме на стандартизированных полях 16x16. За победу ты получаешь ELO, за поражение — теряешь. Сможешь войти в топ-100 глобального лидерборда?</p>
              </div>
              <div className="w-full h-[1px] bg-glass/10" />
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">Искусственный Интеллект</h4>
                <p className="text-foreground/70">Не знаешь, как ходить? Наша AI Academy проанализирует поле и объяснит тебе паттерны прямо во время игры. Идеально для новичков.</p>
              </div>
            </div>
            
            <Link to="/login" className="mt-8 flex items-center gap-2 text-liberty-blue font-bold hover:text-foreground transition-colors group w-fit">
              Создать аккаунт <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right: Playable Mini Game */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-[32px] bg-glass/10 backdrop-blur-2xl border border-glassborder/20 p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-liberty-purple rounded-full blur-[100px] opacity-40 pointer-events-none" />
            
            <div className="w-full flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="font-display font-bold text-2xl">Попробуй сейчас</h3>
                <p className="text-sm text-foreground/60">Классика 9x9, 10 мин</p>
              </div>
              <button 
                onClick={() => restart()}
                className="w-10 h-10 rounded-xl bg-glass/10 flex items-center justify-center hover:bg-glass/20 transition-colors"
                title="Рестарт"
              >
                <RefreshCcw size={18} className="text-foreground" />
              </button>
            </div>

            <div className="relative z-10 bg-black/40 p-4 rounded-2xl border border-glassborder/10 shadow-2xl backdrop-blur-sm mb-6 inline-block">
              <GameBoard 
                cells={state.cells} 
                onReveal={reveal} 
                onFlag={flag} 
                disabled={state.status === 'won' || state.status === 'lost'}
                cellSize={36}
              />
            </div>

            <div className="flex items-center gap-8 text-lg font-mono relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Время</span>
                <span className="font-bold text-foreground">{elapsedFormatted}</span>
              </div>
              <div className="w-[1px] h-8 bg-glass/20" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Мины</span>
                <span className="font-bold text-liberty-red">{minesLeft}</span>
              </div>
            </div>

            {(state.status === 'won' || state.status === 'lost') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                <h3 className={`font-display font-black text-5xl mb-4 ${state.status === 'won' ? 'text-safe' : 'text-liberty-red'}`}>
                  {state.status === 'won' ? 'ПОБЕДА!' : 'БУМ!'}
                </h3>
                <p className="text-foreground/80 mb-6">Время: {elapsedFormatted}</p>
                <button 
                  onClick={() => restart()}
                  className="px-6 py-3 rounded-full bg-foreground text-background font-bold hover:scale-105 transition-transform shadow-xl"
                >
                  Играть снова
                </button>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
