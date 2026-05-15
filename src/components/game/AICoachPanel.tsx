import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, X, MessageSquareWarning, Lightbulb, CheckCircle2, Info, Loader2 } from 'lucide-react'
import type { AcademyMessage } from '@/hooks/useGame'

interface Props {
  messages: AcademyMessage[]
  isAnalyzing: boolean
  onAskHint: () => void
}

export default function AICoachPanel({ messages, isAnalyzing, onAskHint }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isAnalyzing])

  const getIcon = (type: AcademyMessage['type']) => {
    switch (type) {
      case 'warning': return <MessageSquareWarning size={16} className="text-warn shrink-0" />
      case 'error': return <MessageSquareWarning size={16} className="text-accent shrink-0" />
      case 'success': return <CheckCircle2 size={16} className="text-safe shrink-0" />
      case 'info':
      default: return <Info size={16} className="text-primary shrink-0" />
    }
  }

  const getColor = (type: AcademyMessage['type']) => {
    switch (type) {
      case 'warning': return 'bg-warn/10 border-warn/20 text-warn/90'
      case 'error': return 'bg-accent/10 border-accent/20 text-accent/90'
      case 'success': return 'bg-safe/10 border-safe/20 text-safe/90'
      case 'info':
      default: return 'bg-primary/10 border-primary/20 text-primary/90'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 h-[500px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <BrainCircuit size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm leading-none text-foreground">AI Academy</h3>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Powered by Groq</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {messages.length === 0 && !isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <BrainCircuit size={32} className="mb-2" />
            <p className="text-xs font-medium">Сделай ход или попроси подсказку.<br/>Я слежу за твоей логикой.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 p-3 rounded-xl border ${getColor(msg.type)}`}
            >
              {getIcon(msg.type)}
              <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
            </motion.div>
          ))}
          
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-3 rounded-xl border bg-surface border-border text-muted"
            >
              <Loader2 size={16} className="animate-spin shrink-0 text-primary" />
              <p className="text-xs font-medium animate-pulse">Анализирую поле...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-surface">
        <button
          onClick={onAskHint}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-50 disabled:pointer-events-none transition-all font-semibold text-sm"
        >
          <Lightbulb size={16} />
          Спросить ИИ
        </button>
      </div>
    </motion.div>
  )
}
