import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Circle, ShieldCheck, MapPin, Scale, User, Clock, ChevronDown } from 'lucide-react'

export default function TraceabilityTimeline({ events = [] }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="relative py-2">
      {events.map((ev, i) => {
        const isDone = ev.done
        const isActive = ev.active
        const isOpen = openId === ev.id

        return (
          <div key={ev.id} className="relative pl-10 pb-5 last:pb-1">
            {/* Connecting Vertical Line */}
            {i < events.length - 1 && (
              <div 
                className={`absolute left-[13px] top-6 bottom-0 w-[3px] rounded-full transition-colors ${
                  isDone 
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-xs' 
                    : 'bg-slate-200'
                }`} 
              />
            )}

            {/* Node Icon */}
            <span
              className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                isDone 
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                  : isActive 
                    ? 'border-emerald-500 bg-white text-emerald-600 ring-4 ring-emerald-100 animate-pulse' 
                    : 'border-slate-300 bg-slate-50 text-slate-400'
              }`}
            >
              {isDone ? (
                <Check className="h-4 w-4 stroke-[2.5]" />
              ) : (
                <Circle className="h-2.5 w-2.5 fill-current" />
              )}
            </span>

            {/* Event Button */}
            <motion.button
              type="button"
              onClick={() => setOpenId(isOpen ? null : ev.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className={`focus-ring flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all cursor-pointer ${
                isOpen ? 'bg-emerald-50/80 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-display text-xs font-bold ${
                    isDone || isActive ? 'text-[var(--color-ink)]' : 'text-slate-400'
                  }`}>
                    {ev.label}
                  </span>
                  {isDone && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                      Verified
                    </span>
                  )}
                </div>
                {ev.timestamp && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-charcoal)]/60 mt-0.5">
                    <Clock className="h-3 w-3 text-emerald-600" />
                    <span>{ev.timestamp}</span>
                  </div>
                )}
              </div>

              {ev.timestamp && (
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
              )}
            </motion.button>

            {/* Expanded Event Details Card */}
            <AnimatePresence>
              {isOpen && ev.timestamp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-xl bg-emerald-950 p-3.5 text-xs text-white shadow-lg border border-emerald-700/40">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Event: <b className="font-mono text-white">{ev.id}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Location: <b className="text-white">{ev.location || 'Hub'}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <Scale className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Weight: <b className="text-white">{ev.weight} kg</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Responsible: <b className="font-mono text-white">{ev.responsible}</b></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
