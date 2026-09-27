import { useState } from 'react'
import { Card, PageHeader, FadeIn } from '../../components/ui'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../contexts/AuthContext'
import { ShieldCheck, KeyRound, Building2, MapPin, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import PasswordStrengthMeter, { checkPasswordStrength } from '../../components/PasswordStrengthMeter'
import * as api from '../../services/api'

export default function RecyclerProfile() {
  const { session } = useAuth()
  const r = session?.profile || {
    id: 'EC-REC-00001',
    name: 'ASCENT URBAN RECYCLERS PVT LTD',
    location: 'Kanchipuram, Tamil Nadu',
    authStatus: 'AUTHORIZED',
    authNumber: 'SYN-CPCB-REC-10000',
    materialsAccepted: ['Copper', 'Aluminium', 'PCB', 'Plastics'],
    offeredRate: 78.92,
    pickupAvailable: true,
    serviceArea: 'Kanchipuram & surrounding regions',
    contact: '9791111311',
    email: 'muthuraj@aedindia.com',
    accountStatus: 'ACTIVE'
  }

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState('')

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
      setErr('Password must meet all 4 criteria (letters, numbers, special characters, > 6 chars).')
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

  const materialsStr = Array.isArray(r.materialsAccepted) ? r.materialsAccepted.join(', ') : (r.materialsAccepted || 'PCB, Cables')
  const eeeStr = Array.isArray(r.eeeCategories) ? r.eeeCategories.join(', ') : (r.eeeCategories || 'IT Equipment')

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader 
        eyebrow={`Authorized Recycler · ${r.id || 'EC-REC-00001'}`} 
        title={r.companyName || r.name || 'Recycler Profile'} 
        action={<StatusBadge status={r.authStatus || 'AUTHORIZED'} />} 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Authorization & Facility Data */}
        <FadeIn className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Authorization & Facility Verification</h2>
                <p className="text-xs text-[var(--color-charcoal)]/60">Registered under Central Pollution Control Board (CPCB) guidelines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <Row label="Facility / Company" value={r.companyName || r.name} />
              <Row label="CPCB / Auth Registration No." value={r.cpcbRegistrationId || r.authNumber || 'SYN-CPCB-REC-10000'} />
              <Row label="SPCB Authority" value={r.spcbName || 'Tamil Nadu Pollution Control Board'} />
              <Row label="Registration Validity" value={r.registrationValidUntil || '2029-11-17'} />
              <Row label="Annual Capacity" value={r.processingCapacityMtPerYear ? `${r.processingCapacityMtPerYear} MT / year` : '1,500 MT / year'} />
              <Row label="Base Offered Rate" value={`₹${r.offeredRate || 150}/kg (${r.priceMaterial || 'Mixed E-Waste'})`} />
              <Row label="Materials Accepted" value={materialsStr} />
              <Row label="EEE Categories" value={eeeStr} />
              <Row label="Pickup Service" value={r.pickupAvailable ? 'Available within service area' : 'Drop-off only'} />
              <Row label="Service Area" value={r.serviceArea || 'Regional 25 km radius'} />
            </div>
          </Card>

          {/* Location & Contact */}
          <Card>
            <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Facility Location & Contact Details</h2>
                <p className="text-xs text-[var(--color-charcoal)]/60">Official physical plant coordinates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <Row label="Physical Address" value={r.facilityAddress || r.location || 'Kanchipuram'} />
              <Row label="District & State" value={`${r.district || ''} ${r.state || ''}${r.pincode ? ` (${r.pincode})` : ''}`.trim() || r.location} />
              <Row label="Official Phone" value={r.officialPhone || r.contact || '+91 9791111311'} />
              <Row label="Official Email" value={r.officialEmail || r.email || 'contact@ecircle.org'} />
              <Row label="Verification Status" value={r.verificationStatus || 'Verified Authorized'} />
              <Row label="Account Status" value={r.accountStatus || 'ACTIVE'} />
            </div>
          </Card>
        </FadeIn>

        {/* Password & Security Panel */}
        <FadeIn delay={0.1}>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] pb-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--color-ink)]">Recycler Password</h2>
                  <p className="text-xs text-[var(--color-charcoal)]/60">Must meet strong security policy</p>
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
                      placeholder="Current password"
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

                  <PasswordStrengthMeter password={newPw} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/80">
                    Confirm Password
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
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{err}</span>
                  </div>
                )}

                {msg && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
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
                  {saving ? 'Saving...' : 'Update Recycler Password'}
                </button>
              </form>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-[var(--color-hairline)]/70">
      <div className="text-[11px] font-semibold text-[var(--color-charcoal)]/60">{label}</div>
      <div className="mt-0.5 font-bold text-[var(--color-ink)] text-xs">{value}</div>
    </div>
  )
}
