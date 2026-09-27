import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Scale, Users, Building2, Clock, CheckCircle2, DollarSign, Leaf, Sparkles, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { PageHeader, Card, KpiStat, Skeleton, FadeIn } from '../../components/ui'
import * as api from '../../services/api'

const ECO_PALETTE = ['#059669', '#10B981', '#34D399', '#047857', '#064E3B', '#D97706', '#F59E0B', '#6EE7B7']

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => { 
    api.getAdminDashboard().then(setData) 
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  const k = data.kpis

  return (
    <div className="space-y-6">
      {/* Eco Impact Hero Banner */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/30">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-3">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                <span>Central Governance & Traceability Dashboard</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl text-white">
                Formal E-Waste Circular Network
              </h1>
              <p className="mt-2 max-w-xl text-sm text-emerald-100/80 leading-relaxed">
                Real-time visibility across 108 authorized recyclers, authorized lot flows, AI verification grades, and auditable chain of custody.
              </p>
            </div>

            {/* Quick Impact Highlight Chips */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 shrink-0">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/50 p-3.5 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Total Volume</div>
                <div className="mt-1 font-display text-2xl font-black text-white">{k.totalWeight} <span className="text-sm font-semibold text-emerald-400">kg</span></div>
                <div className="text-[10px] text-emerald-300/70 mt-0.5">Formalized E-Waste</div>
              </div>

              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/50 p-3.5 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">CO₂ Avoided</div>
                <div className="mt-1 font-display text-2xl font-black text-white">{Math.round(parseFloat(k.totalWeight || 0) * 1.8)} <span className="text-sm font-semibold text-teal-400">kg</span></div>
                <div className="text-[10px] text-teal-300/70 mt-0.5">GHG Emission Offset</div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-emerald-500/30 bg-emerald-950/50 p-3.5 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Est. Market Value</div>
                <div className="mt-1 font-display text-2xl font-black text-emerald-300">₹{(k.estimatedValue || 0).toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-300/70 mt-0.5">Fair Pricing Board</div>
              </div>
            </div>
          </div>

          {/* Background Ambient SVG */}
          <div className="pointer-events-none absolute right-0 bottom-0 top-0 opacity-10">
            <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
              <circle cx="300" cy="100" r="140" stroke="#34D399" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="300" cy="100" r="90" stroke="#10B981" strokeWidth="3" />
              <circle cx="300" cy="100" r="40" fill="#059669" />
            </svg>
          </div>
        </div>
      </FadeIn>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FadeIn delay={0.05}>
          <Card>
            <KpiStat 
              label="Active Recyclers" 
              value={`${k.activeRecyclers}`} 
              suffix={`/ ${k.totalRecyclers}`}
              icon={Building2} 
              trend="+12% YoY" 
              trendPositive={true}
              description="Authorized CPCB/SPCB"
            />
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <KpiStat 
              label="Active Collectors" 
              value={`${k.activeCollectors}`} 
              suffix={`/ ${k.totalCollectors}`}
              icon={Users} 
              trend="+8% this mo." 
              trendPositive={true}
              description="Informal-to-Formal"
            />
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <KpiStat 
              label="Pending Requests" 
              value={k.pendingRequests} 
              icon={Clock} 
              trend="Requires Action"
              trendPositive={false}
              description="Awaiting Recycler quote"
            />
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card>
            <KpiStat 
              label="Completed Handovers" 
              value={k.completedHandovers} 
              icon={CheckCircle2} 
              trend="100% Tracked" 
              trendPositive={true}
              description="Verified with Geo-timestamp"
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
                  E-Waste Collection & Circular Recovery (kg)
                </div>
                <div className="text-xs text-[var(--color-charcoal)]/60">
                  Monthly volume aggregated across all regional collection hubs
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" /> +24% growth
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.collectionTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#D0E4D9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#23372E', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#23372E' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: '1px solid #D0E4D9', 
                      boxShadow: '0 8px 24px -4px rgba(5, 32, 20, 0.12)', 
                      fontSize: 13,
                      fontWeight: 600,
                      backgroundColor: '#FFFFFF'
                    }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="h-full flex flex-col justify-between">
            <div className="mb-3">
              <div className="font-display text-base font-bold text-[var(--color-ink)]">
                Material Recovery Distribution
              </div>
              <div className="text-xs text-[var(--color-charcoal)]/60">
                Sorted fractions by volume weight
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data.materialDistribution} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={50} 
                    outerRadius={80} 
                    paddingAngle={3}
                  >
                    {data.materialDistribution.map((_, i) => (
                      <Cell key={i} fill={ECO_PALETTE[i % ECO_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: '1px solid #D0E4D9', 
                      boxShadow: '0 8px 20px -4px rgba(5, 32, 20, 0.1)', 
                      fontSize: 13 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-[var(--color-hairline)] pt-3 text-[11px]">
              {data.materialDistribution.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[var(--color-charcoal)]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ECO_PALETTE[i % ECO_PALETTE.length] }} />
                  <span className="truncate font-medium">{m.name}: {m.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.25} className="lg:col-span-2">
          <Card>
            <div className="mb-3 font-display text-base font-bold text-[var(--color-ink)]">
              Lot Status Pipeline
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.lotStatus} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid stroke="#D0E4D9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#23372E' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#23372E', fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D0E4D9', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card>
            <div className="mb-3 font-display text-base font-bold text-[var(--color-ink)]">
              Monthly Transactions
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.transactionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#D0E4D9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#23372E' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#23372E' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D0E4D9', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
