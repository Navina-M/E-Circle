import { Check, X, ShieldCheck, ShieldAlert } from 'lucide-react'

export function checkPasswordStrength(password = '') {
  const p = password || ''
  const hasMinLength = p.length > 6
  const hasLetters = /[a-zA-Z]/.test(p)
  const hasUpper = /[A-Z]/.test(p)
  const hasLower = /[a-z]/.test(p)
  const hasDigits = /\d/.test(p)
  const hasSpecial = /[^a-zA-Z0-9]/.test(p)

  const rules = [
    { label: 'More than 6 characters (7+ chars)', pass: hasMinLength },
    { label: 'Letters (Upper & Lowercase)', pass: hasLetters && (hasUpper || hasLower) },
    { label: 'At least one number (0-9)', pass: hasDigits },
    { label: 'Special character (e.g. !@#$%^&*)', pass: hasSpecial },
  ]

  const passedCount = rules.filter((r) => r.pass).length
  const isStrong = passedCount === rules.length

  let strengthLabel = 'Weak'
  let color = 'bg-rose-500'
  let textCol = 'text-rose-600'
  let bgLight = 'bg-rose-50'

  if (passedCount === 4) {
    strengthLabel = 'Very Strong'
    color = 'bg-emerald-500'
    textCol = 'text-emerald-700'
    bgLight = 'bg-emerald-50'
  } else if (passedCount === 3) {
    strengthLabel = 'Good'
    color = 'bg-emerald-400'
    textCol = 'text-emerald-600'
    bgLight = 'bg-emerald-50'
  } else if (passedCount === 2) {
    strengthLabel = 'Fair'
    color = 'bg-amber-400'
    textCol = 'text-amber-600'
    bgLight = 'bg-amber-50'
  }

  return {
    rules,
    passedCount,
    isStrong,
    strengthLabel,
    color,
    textCol,
    bgLight,
    percent: (passedCount / rules.length) * 100,
  }
}

export default function PasswordStrengthMeter({ password = '', showRules = true, className = '' }) {
  if (!password) return null

  const { rules, passedCount, isStrong, strengthLabel, color, textCol, bgLight, percent } = checkPasswordStrength(password)

  return (
    <div className={`mt-2.5 rounded-xl border border-[var(--color-hairline)] ${bgLight} p-3 transition-all ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-[var(--color-charcoal)]">
          {isStrong ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          )}
          Security Rating:
        </span>
        <span className={`font-bold ${textCol}`}>{strengthLabel}</span>
      </div>

      {/* Visual meter bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showRules && (
        <div className="mt-3 grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2">
          {rules.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 transition-colors ${
                r.pass ? 'font-medium text-emerald-800' : 'text-[var(--color-charcoal)]/60'
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] ${
                  r.pass ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {r.pass ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <X className="h-2.5 w-2.5" />}
              </span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
