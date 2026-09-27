import { useState } from 'react'
import { Card, PageHeader, FadeIn } from '../../components/ui'
import { Shield, KeyRound, CheckCircle, AlertCircle, Loader2, Save, Sliders, Database, RefreshCw, Eye, EyeOff } from 'lucide-react'
import PasswordStrengthMeter, { checkPasswordStrength } from '../../components/PasswordStrengthMeter'
import * as api from '../../services/api'

export default function Settings() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState('')

  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  async function handlePasswordChange(e) {
    e.preventDefault()
    setErr('')
    setMsg(null)

    if (newPw !== confirmPw) {
      setErr('New password and confirmation do not match.')
      return
    }

    const { isStrong } = checkPasswordStrength(newPw)
    if (!isStrong) {
      setErr('New password must meet all 4 strong security criteria (letters, numbers, special characters, > 6 chars).')
      return
    }

    setSaving(true)
    try {
      const res = await api.apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword: currentPw, newPassword: newPw },
      })
      setMsg(res.message || 'Password changed successfully!')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (error) {
      setErr(error.message || 'Failed to change password. Verify your current password.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReimport() {
    setImporting(true)
    setImportMsg('')
    try {
      const res = await api.importRecyclers()
      setImportMsg(`Database refreshed successfully! (${res.imported_recyclers || 108} recyclers initialized)`)
    } catch (e) {
      setImportMsg('Failed to refresh data: ' + e.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Security & System" title="Platform Settings" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Password Security Card */}
        <FadeIn>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Admin Password & Security</h2>
                  <p className="text-xs text-[var(--color-charcoal)]/60">Enforce strong credentials across platform governance</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/80">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full rounded-xl border border-[var(--color-hairline)] bg-white px-3.5 py-2.5 pr-10 text-sm text-[var(--color-ink)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/80">
                    New Strong Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Mix of letters, special, numbers &gt; 6 chars"
                      required
                      className="w-full rounded-xl border border-[var(--color-hairline)] bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-[var(--color-ink)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Real-time Strength Meter */}
                  <PasswordStrengthMeter password={newPw} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/80">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-white px-3.5 py-2.5 text-sm font-mono text-[var(--color-ink)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {err && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{err}</span>
                  </div>
                )}

                {msg && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || !newPw}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Updating Password...' : 'Save New Admin Password'}
                </button>
              </form>
            </div>
          </Card>
        </FadeIn>

        {/* System Data & Policy Settings */}
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Platform Security Policy</h2>
                  <p className="text-xs text-[var(--color-charcoal)]/60">Active rules applied to all platform accounts</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[var(--color-charcoal)]">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[var(--color-hairline)]">
                  <span className="font-semibold">Password Length</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">&gt; 6 characters (7+ required)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[var(--color-hairline)]">
                  <span className="font-semibold">Complexity Mix</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">Letters + Special + Numbers</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[var(--color-hairline)]">
                  <span className="font-semibold">JWT Session Validity</span>
                  <span className="font-mono text-slate-600">24 Hours (1440 mins)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[var(--color-hairline)]">
                  <span className="font-semibold">Recycler Data Isolation</span>
                  <span className="rounded-md bg-teal-100 px-2 py-0.5 font-bold text-teal-800">Strictly Enforced</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Dataset & Database State</h2>
                  <p className="text-xs text-[var(--color-charcoal)]/60">Authorized CPCB / SPCB recycling registry</p>
                </div>
              </div>

              <p className="text-xs text-[var(--color-charcoal)]/70 mb-3">
                108 verified authorized recycling facilities currently mapped across Tamil Nadu and South India with FairRoute spatial algorithms.
              </p>

              <button
                onClick={handleReimport}
                disabled={importing}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors w-full"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {importing ? 'Synchronizing Recyclers...' : 'Refresh Authorized Recyclers Registry'}
              </button>

              {importMsg && (
                <div className="mt-2 text-center text-xs font-semibold text-emerald-700">
                  {importMsg}
                </div>
              )}
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
