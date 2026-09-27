import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Truck,
  Navigation,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Leaf,
  ExternalLink
} from 'lucide-react'
import { Card, PageHeader, Skeleton, EmptyState, FadeIn } from '../../components/ui'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../services/api'

export default function Pickups() {
  const { session } = useAuth()
  const recyclerId = session?.profile?.id || session?.username || 'REC-2026-000001'
  const [lots, setLots] = useState(null)
  const [selectedLot, setSelectedLot] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    if (!recyclerId) return
    api.getRecyclerLots(recyclerId, { page: 1, pageSize: 50 })
      .then((r) => {
        const relevant = (r.items || []).filter((l) =>
          ['PICKUP_SCHEDULED', 'ACCEPTED', 'HANDED_OVER', 'COMPLETED'].includes(l.status)
        )
        setLots(relevant)
        if (relevant.length > 0) {
          setSelectedLot(relevant[0])
        }
      })
      .catch(() => setLots([]))
  }, [recyclerId])

  const filteredLots = lots
    ? lots.filter((l) => {
        if (activeFilter === 'ALL') return true
        if (activeFilter === 'SCHEDULED') return ['ACCEPTED', 'PICKUP_SCHEDULED'].includes(l.status)
        if (activeFilter === 'IN_TRANSIT') return l.status === 'HANDED_OVER'
        if (activeFilter === 'COMPLETED') return l.status === 'COMPLETED'
        return true
      })
    : []

  const totalWeight = filteredLots.reduce((acc, curr) => acc + (curr.weight || 0), 0)
  const estimatedCarbonOffset = (totalWeight * 1.84).toFixed(1)

  return (
    <FadeIn className="space-y-6">
      <PageHeader
        eyebrow="Logistics & FairRoute Routing"
        title="Pickups & Transport Routes"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              Est. Carbon Saved: {estimatedCarbonOffset} kg CO₂
            </span>
          </div>
        }
      />

      {/* Interactive FairRoute Route Visualizer & Summary Header */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Route Simulator & Interactive Vector Map */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="overflow-hidden p-0">
            {/* Interactive Vector GIS Map canvas */}
            <div className="relative h-72 w-full bg-slate-900 text-white overflow-hidden">
              {/* Map grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

              {/* Geographic Contour Mocking */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg className="h-full w-full" viewBox="0 0 600 300">
                  <path
                    d="M50,150 Q180,40 320,160 T550,120"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="6,6"
                    className="animate-pulse"
                  />
                  <path
                    d="M100,200 Q250,100 400,220 T580,180"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    opacity="0.4"
                  />
                </svg>
              </div>

              {/* Route Markers */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2 rounded-xl bg-slate-800/90 p-3 shadow-lg border border-emerald-500/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Origin / Collector Hub
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {selectedLot?.location || 'Chennai Central Hub'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-10 top-1/3 rounded-xl bg-slate-800/90 p-3 shadow-lg border border-teal-500/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                      Destination Facility
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {session?.profile?.companyName || 'Recycler Processing Plant'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Footer Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 p-3 backdrop-blur-md border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                    FairRoute Smart Optimized
                  </span>
                  <span>·</span>
                  <span>Est. Transit: ~45 mins (28.4 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Eco-Route: Lowest Carbon
                  </span>
                </div>
              </div>
            </div>

            {/* Route Details Ribbon */}
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-hairline)] bg-slate-50 p-4 sm:grid-cols-4 text-xs">
              <div>
                <div className="text-[11px] text-[var(--color-charcoal)]/50">Active Batch</div>
                <div className="font-semibold text-[var(--color-ink)]">{selectedLot?.id || 'Select a lot'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-charcoal)]/50">Payload Weight</div>
                <div className="font-semibold text-[var(--color-ink)]">{selectedLot?.weight || 0} kg ({selectedLot?.material})</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-charcoal)]/50">Collector Point</div>
                <div className="font-semibold text-[var(--color-ink)]">{selectedLot?.collectorId || 'Assigned'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-charcoal)]/50">Navigation Action</div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLot?.location || 'Chennai')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-semibold text-[var(--color-leaf)] hover:underline"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Quick Stats & Filter Chips */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--color-leaf)]" /> Route Filter
            </h3>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SCHEDULED', label: 'Scheduled' },
                { id: 'IN_TRANSIT', label: 'In Transit' },
                { id: 'COMPLETED', label: 'Received' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeFilter === f.id
                      ? 'bg-[var(--color-leaf)] text-white shadow-sm'
                      : 'border border-[var(--color-hairline)] bg-white text-[var(--color-charcoal)] hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="border-t border-[var(--color-hairline)] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-[var(--color-charcoal)]">
                <span>Total Filtered Lots:</span>
                <span className="font-bold text-[var(--color-ink)]">{filteredLots.length}</span>
              </div>
              <div className="flex justify-between text-[var(--color-charcoal)]">
                <span>Aggregated Volume:</span>
                <span className="font-bold text-[var(--color-ink)]">{totalWeight} kg</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Pickup List Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
            Scheduled Logistics Queue
          </h2>
          <span className="text-xs text-[var(--color-charcoal)]/60">
            {filteredLots.length} lots available for pickup/transport
          </span>
        </div>

        {!lots ? (
          <Skeleton className="h-36 w-full" />
        ) : filteredLots.length === 0 ? (
          <EmptyState title="No pickup schedules matching this filter" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLots.map((l) => (
              <Card
                key={l.id}
                className={`transition cursor-pointer border ${
                  selectedLot?.id === l.id
                    ? 'border-[var(--color-leaf)] ring-1 ring-[var(--color-leaf)]/30 shadow-md'
                    : 'hover:border-slate-300'
                }`}
                onClick={() => setSelectedLot(l)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display font-bold text-[var(--color-ink)]">
                    {l.id}
                  </span>
                  <StatusBadge status={l.status} />
                </div>

                <div className="space-y-1.5 text-xs text-[var(--color-charcoal)]">
                  <div className="font-medium text-[var(--color-ink)]">
                    {l.material} · <span className="text-emerald-700 font-bold">{l.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--color-charcoal)]/70">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-leaf)]" />
                    <span className="truncate">{l.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--color-charcoal)]/60">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Est. Payout: ₹{l.estimatedValue?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-hairline)] pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedLot(l)
                    }}
                    className="focus-ring rounded-lg bg-[var(--color-leaf-pale)] px-2.5 py-1 text-xs font-semibold text-[var(--color-leaf)] hover:bg-emerald-100"
                  >
                    Select Route
                  </button>

                  <Link
                    to={`/recycler/lots/${l.id}`}
                    className="focus-ring flex items-center gap-1 text-xs font-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  )
}
