import { motion } from 'framer-motion'
import { Search, Inbox, AlertTriangle, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

export function Card({ children, className = '', hover = true, ...rest }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-5 ${hover ? 'glass-card-hover' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function KpiStat({ 
  label, 
  value, 
  big = false, 
  suffix = '', 
  icon: Icon, 
  trend, 
  trendPositive = true,
  description 
}) {
  return (
    <div className={big ? 'py-1' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-charcoal)]/70">
          {label}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-leaf-pale)] text-[var(--color-leaf)] border border-[var(--color-leaf-subtle)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-display font-bold text-[var(--color-ink)] tracking-tight ${big ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>
          {value}
        </span>
        {suffix && (
          <span className="text-base font-semibold text-[var(--color-leaf)]">
            {suffix}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${
            trendPositive 
              ? 'bg-emerald-100/80 text-emerald-800' 
              : 'bg-rose-100/80 text-rose-800'
          }`}>
            {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
          {description && (
            <span className="text-[var(--color-charcoal)]/60 text-[11px]">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gradient-to-r from-[var(--color-hairline)]/50 via-white/80 to-[var(--color-hairline)]/50 ${className}`} />
  )
}

export function EmptyState({ title = 'Nothing here yet', detail = '', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-leaf-pale)] text-[var(--color-leaf)] border border-[var(--color-leaf-subtle)]">
        <Icon className="h-7 w-7" />
      </div>
      <div className="font-display text-base font-semibold text-[var(--color-ink)]">{title}</div>
      {detail && <div className="max-w-sm text-sm text-[var(--color-charcoal)]/60">{detail}</div>}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong loading this.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[var(--color-rust)] border border-rose-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="text-sm font-medium text-[var(--color-charcoal)]">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="focus-ring rounded-lg border border-[var(--color-leaf-light)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--color-leaf)] hover:bg-[var(--color-leaf-pale)] transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-charcoal)]/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-xl border border-[var(--color-hairline)] bg-white/90 py-2.5 pl-9 pr-3 text-sm placeholder:text-[var(--color-charcoal)]/40 shadow-sm transition-all focus:border-[var(--color-leaf)] focus:bg-white"
      />
    </div>
  )
}

export function Select({ value, onChange, options, placeholder = 'All' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring rounded-xl border border-[var(--color-hairline)] bg-white/90 px-3.5 py-2.5 text-sm font-medium text-[var(--color-charcoal)] shadow-sm transition-all focus:border-[var(--color-leaf)]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{typeof o === 'string' ? o.replaceAll('_', ' ') : o}</option>
      ))}
    </select>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-hairline)] px-2 pt-4">
      <span className="text-xs font-medium text-[var(--color-charcoal)]/70">Page {page} of {totalPages}</span>
      <div className="flex gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="focus-ring flex items-center justify-center h-8 w-8 rounded-lg border border-[var(--color-hairline)] bg-white text-[var(--color-charcoal)] hover:bg-[var(--color-leaf-pale)] hover:border-[var(--color-leaf-light)] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="focus-ring flex items-center justify-center h-8 w-8 rounded-lg border border-[var(--color-hairline)] bg-white text-[var(--color-charcoal)] hover:bg-[var(--color-leaf-pale)] hover:border-[var(--color-leaf-light)] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, action, badge }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-leaf)] mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{eyebrow}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] md:text-3xl tracking-tight">{title}</h1>
          {badge}
        </div>
      </div>
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  )
}

export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
