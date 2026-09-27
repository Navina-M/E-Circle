const TONES = {
  CREATED: 'bg-slate-100 text-slate-700 border-slate-200/80',
  AI_VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-sm',
  MATCHED: 'bg-teal-50 text-teal-800 border-teal-200/90',
  REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200/90',
  ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200/90',
  PICKUP_SCHEDULED: 'bg-amber-50 text-amber-800 border-amber-200/90',
  HANDED_OVER: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
  PAYMENT_PENDING: 'bg-amber-50 text-amber-800 border-amber-200/90',
  COMPLETED: 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white border-emerald-900 shadow-sm',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-sm',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
  AUTHORIZED: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-sm',
  PENDING_RENEWAL: 'bg-amber-50 text-amber-800 border-amber-200/90',
  PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200/90',
  PROCESSING: 'bg-amber-50 text-amber-800 border-amber-200/90',
}

const PULSING_STATUSES = ['AI_VERIFIED', 'AUTHORIZED', 'ACTIVE', 'REQUESTED', 'PICKUP_SCHEDULED', 'PROCESSING']

export default function StatusBadge({ status = 'ACTIVE', showDot = true, size = 'sm' }) {
  const normalized = status ? status.toUpperCase() : 'ACTIVE'
  const tone = TONES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
  const isPulsing = PULSING_STATUSES.includes(normalized)

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium capitalize tracking-wide transition-colors ${sizeClasses} ${tone}`}>
      {showDot && (
        <span className="relative flex h-2 w-2">
          {isPulsing && (
            <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current opacity-90" />
        </span>
      )}
      {normalized.replaceAll('_', ' ').toLowerCase()}
    </span>
  )
}
