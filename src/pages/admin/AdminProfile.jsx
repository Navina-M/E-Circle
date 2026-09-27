import { Link } from 'react-router-dom'
import { Card, PageHeader, FadeIn } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import { ShieldCheck, KeyRound, ArrowRight, User, CheckCircle2, Lock } from 'lucide-react'

export default function AdminProfile() {
  const { session } = useAuth()
  const username = session?.profile?.username || session?.username || 'admin'

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader eyebrow="Account & Governance" title="Administrator Profile" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FadeIn className="md:col-span-2">
          <Card>
            <div className="flex items-center gap-4 border-b border-[var(--color-hairline)] pb-5 mb-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-900/20 text-xl font-bold">
                AD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    Platform Administrator
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Root
                  </span>
                </div>
                <div className="text-xs text-[var(--color-charcoal)]/60 mt-0.5">
                  Central authority for e-waste formalization registry & compliance
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <Row label="System Username" value={username} isMono />
              <Row label="Role & Access Level" value="Root Governance (Full Access)" />
              <Row label="Authentication Mode" value="Strong Multi-Criteria Credentials" />
              <Row label="Session Duration" value="24 Hours (Active Token)" />
              <Row label="Platform Instance" value="E-CIRCLE v2.6 Production" />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Security Controls</span>
              </div>
              <p className="text-xs text-[var(--color-charcoal)]/70 leading-relaxed">
                Your account is protected under the new high-entropy password standard.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Strong mix enforced</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Letters, symbols & numbers</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Length &gt; 6 characters</span>
                </div>
              </div>
            </div>

            <Link
              to="/admin/settings"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-leaf)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--color-ink)] transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              <span>Change Password</span>
            </Link>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

function Row({ label, value, isMono = false }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-hairline)]/70 pb-2.5 last:border-0">
      <span className="text-xs font-medium text-[var(--color-charcoal)]/70">{label}</span>
      <span className={`text-xs font-bold text-[var(--color-ink)] ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
