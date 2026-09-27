import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Building2, Inbox, CheckCircle2, Truck, Sparkles, ArrowRight, ShieldCheck, TrendingUp, Scale, Clock } from 'lucide-react'
import { Card, KpiStat, Skeleton, FadeIn } from '../../components/ui'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../services/api'

const ECO_PALETTE = ['#059669', '#10B981', '#34D399', '#047857', '#064E3B', '#D97706']

export default function RecyclerDashboard() {
  const { session } = useAuth()
  const [data, setData] = useState(null)
  
  const r = session?.profile || {
    id: 'EC-REC-00001',
    name: 'ASCENT URBAN RECYCLERS PVT LTD',
    location: 'Kanchipuram, Tamil Nadu',
    authStatus: 'AUTHORIZED'
  }
  const recyclerId = r.id || session?.username || 'EC-REC-00001'

  useEffect(() => {
    if (!recyclerId) return
    api.getRecyclerDashboard(recyclerId)
      .then(setData)
      .catch((err) => console.error("Error fetching recycler dashboard:", err))
  }, [recyclerId])

  return (
    <div className="space-y-6">
      {/* Recycler Facility Hero Header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/30">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Authorized Recycler Portal</span>
                </span>
                <StatusBadge status={r.authStatus || 'AUTHORIZED'} />
              </div>

              <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl text-white">
                {r.companyName || r.name || recyclerId}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-200/80">
                <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/40">{recyclerId}</span>
                <span>•</span>
                <span>{r.location || 'Tamil Nadu'}</span>
                <span>•</span>
                <span>CPCB Auth: {r.authNumber || r.cpcbRegistrationId || 'SYN-CPCB-REC-10000'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/recycler/received-lots"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-900/30 hover:shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                <span>View Incoming Requests</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      {!data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <FadeIn delay={0.05}>
              <Card>
                <KpiStat 
                  label="New Lot Requests" 
                  value={data.kpis?.newRequests ?? 0} 
                  icon={Inbox}
                  trend={data.kpis?.newRequests > 0 ? "Action Required" : "Up to date"}
                  trendPositive={data.kpis?.newRequests === 0}
                  description="Awaiting your quote/acceptance"
                />
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card>
                <KpiStat 
                  label="Accepted Lots" 
                  value={data.kpis?.acceptedLots ?? 0} 
                  icon={CheckCircle2}
                  trend="In Pipeline"
                  trendPositive={true}
                  description="Ready for pickup schedule"
                />
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card>
                <KpiStat 
                  label="Pending Pickups" 
                  value={data.kpis?.pendingPickups ?? 0} 
                  icon={Truck}
                  trend="Logistics Scheduled"
                  trendPositive={true}
                  description="Awaiting handover"
                />
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card>
                <KpiStat 
                  label="Completed Lots" 
                  value={data.kpis?.completedLots ?? 0} 
                  icon={Scale}
                  trend="100% Traceable"
                  trendPositive={true}
                  description="Handovers confirmed"
                />
              </Card>
            </FadeIn>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <FadeIn delay={0.15} className="lg:col-span-2">
              <Card className="h-full flex flex-col justify-between">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-display text-base font-bold text-[var(--color-ink)]">
                      Monthly Received E-Waste Weight (kg)
                    </div>
                    <div className="text-xs text-[var(--color-charcoal)]/60">
                      Volume processed through formal handovers
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" /> Steady intake
                  </span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.weightTrend || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="recColorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#D0E4D9" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#23372E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#23372E' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: 12, 
                          border: '1px solid #D0E4D9', 
                          fontSize: 13,
                          fontWeight: 600,
                          backgroundColor: '#FFFFFF'
                        }} 
                      />
                      <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#recColorTrend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card className="h-full flex flex-col justify-between">
                <div className="mb-3">
                  <div className="font-display text-base font-bold text-[var(--color-ink)]">
                    Fraction Breakdown
                  </div>
                  <div className="text-xs text-[var(--color-charcoal)]/60">
                    Allocated material types
                  </div>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={data.materialDistribution || []} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={45} 
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {(data.materialDistribution || []).map((_, i) => (
                          <Cell key={i} fill={ECO_PALETTE[i % ECO_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D0E4D9', fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-[var(--color-hairline)] pt-3 text-[11px]">
                  {(data.materialDistribution || []).slice(0, 4).map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[var(--color-charcoal)]">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ECO_PALETTE[i % ECO_PALETTE.length] }} />
                      <span className="truncate font-medium">{m.name}: {m.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeIn>
          </div>

          {/* Recent Lot Requests Table */}
          <FadeIn delay={0.25}>
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[var(--color-hairline)] p-4 bg-slate-50/50">
                <div>
                  <div className="font-display text-base font-bold text-[var(--color-ink)]">
                    Recent Assigned Lot Requests
                  </div>
                  <div className="text-xs text-[var(--color-charcoal)]/60">
                    Direct collector matches awaiting handover
                  </div>
                </div>
                <Link to="/recycler/received-lots" className="text-xs font-bold text-[var(--color-leaf)] hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-hairline)] text-xs uppercase tracking-wider text-[var(--color-charcoal)]/60 bg-emerald-50/40">
                      <th className="px-4 py-3 font-semibold">Lot ID</th>
                      <th className="px-4 py-3 font-semibold">Material</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Quoted Price</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentLots || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-[var(--color-charcoal)]/60">
                          No recent lots in pipeline.
                        </td>
                      </tr>
                    ) : (
                      (data.recentLots || []).map((l) => (
                        <tr key={l.id} className="border-b border-[var(--color-hairline)] last:border-0 hover:bg-emerald-50/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-xs text-[var(--color-ink)]">{l.id}</td>
                          <td className="px-4 py-3 font-medium">{l.material}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-800">{l.weight} kg</td>
                          <td className="px-4 py-3 text-xs text-[var(--color-charcoal)]/80">{l.location || 'Collection Point'}</td>
                          <td className="px-4 py-3 font-semibold">₹{(l.quotedPrice || 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                          <td className="px-4 py-3 text-right">
                            <Link 
                              to={`/recycler/lots/${l.id}`} 
                              className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-leaf-pale)] px-2.5 py-1 text-xs font-bold text-[var(--color-leaf)] hover:bg-[var(--color-leaf)] hover:text-white transition-colors"
                            >
                              <span>Manage</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
