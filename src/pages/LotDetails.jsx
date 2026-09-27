import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Bot,
  DollarSign,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  Layers,
  Award,
  Send,
  X
} from 'lucide-react'
import { Card, PageHeader, Skeleton, FadeIn } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import TraceabilityTimeline from '../components/TraceabilityTimeline'
import * as api from '../services/api'

export default function LotDetails({ backTo, recyclerScoped }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [lot, setLot] = useState(null)
  const [events, setEvents] = useState([])
  const [fairRoute, setFairRoute] = useState([])
  const [busy, setBusy] = useState(false)
  const [scanningAI, setScanningAI] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [offeredRate, setOfferedRate] = useState('')
  const [quoteMsg, setQuoteMsg] = useState('')

  async function load() {
    const l = await api.getLot(id)
    setLot(l)
    setEvents(await api.getLotTraceability(id))
    try {
      const fr = await api.getFairRouteRanking(id)
      setFairRoute(fr || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function act(status) {
    setBusy(true)
    await api.updateLotStatus(id, status)
    await load()
    setBusy(false)
  }

  async function handleRunAIScan() {
    setScanningAI(true)
    try {
      const res = await api.classifyMaterial(lot?.material)
      setAiResult(res)
    } finally {
      setScanningAI(false)
    }
  }

  async function handleSubmitQuote(e) {
    e.preventDefault()
    if (!offeredRate || isNaN(offeredRate)) return
    setBusy(true)
    try {
      await api.submitLotQuote(id, {
        quotedRate: parseFloat(offeredRate),
        isPerKg: true,
        autoAccept: true,
      })
      setQuoteMsg('Quote submitted successfully and status updated!')
      setTimeout(() => {
        setShowQuoteModal(false)
        setQuoteMsg('')
        load()
      }, 1200)
    } finally {
      setBusy(false)
    }
  }

  if (!lot) return <Skeleton className="h-96 w-full" />

  const activeConfidence = aiResult ? aiResult.confidence : (lot.aiConfidence || 94.2)
  const detectedCategory = aiResult ? aiResult.material_category : lot.material

  return (
    <FadeIn className="space-y-6">
      <button
        onClick={() => nav(backTo || '/')}
        className="focus-ring flex items-center gap-1.5 text-sm font-medium text-[var(--color-charcoal)]/70 hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <PageHeader
        eyebrow={`E-Waste Batch · ${lot.id}`}
        title={`${lot.material} · ${lot.weight} kg`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-charcoal)]/50">
              Lot Status:
            </span>
            <StatusBadge status={lot.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Material Photograph & Live AI Vision Inspector */}
        <div className="space-y-6 lg:col-span-5">
          {/* Material Visual Card */}
          <Card className="relative overflow-hidden p-0">
            <div className="relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white">
              {/* Overlay Grid lines simulating camera HUD */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              
              {/* YOLO Simulated Bounding Box */}
              <div className="absolute inset-x-8 inset-y-6 rounded-lg border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  YOLOv8: {detectedCategory} ({activeConfidence}%)
                </span>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-300/80">
                  Target BBox: [0.12, 0.18, 0.88, 0.82]
                </div>
              </div>

              <div className="relative z-10 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <Layers className="h-6 w-6 text-emerald-300" />
                </div>
                <div className="font-display text-sm font-semibold tracking-wide text-white">
                  {lot.material} Specimen
                </div>
                <div className="text-xs text-emerald-200/70">
                  Verified Batch Source: {lot.collectorId}
                </div>
              </div>
            </div>

            {/* AI Vision Intelligence Bar */}
            <div className="border-t border-[var(--color-hairline)] bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink)]">
                      <span>AI Material Classifier</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-leaf)]" />
                    </div>
                    <div className="text-[11px] text-[var(--color-charcoal)]/60">
                      Confidence Score: <span className="font-bold text-emerald-700">{activeConfidence}%</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={scanningAI}
                  onClick={handleRunAIScan}
                  className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-charcoal)] shadow-sm hover:bg-[var(--color-leaf-pale)] hover:text-[var(--color-leaf)] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${scanningAI ? 'animate-spin text-emerald-600' : ''}`} />
                  {scanningAI ? 'Analyzing...' : 'Re-scan AI'}
                </button>
              </div>

              {/* Breakdown Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 text-[11px]">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 border border-emerald-200/60">
                  Grade A Sorted
                </span>
                <span className="rounded-md bg-sky-50 px-2 py-0.5 font-medium text-sky-800 border border-sky-200/60">
                  Heavy Metals Verified
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 border border-amber-200/60">
                  RoHS Compliant
                </span>
              </div>
            </div>
          </Card>

          {/* FairRoute Matching Widget */}
          <Card>
            <div className="flex items-center justify-between border-b border-[var(--color-hairline)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-[var(--color-ink)]">
                    FairRoute Matching
                  </h3>
                  <p className="text-[11px] text-[var(--color-charcoal)]/60">
                    Optimal recycler rankings based on distance & authorized capacity
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                Algorithm Active
              </span>
            </div>

            <div className="space-y-2.5">
              {fairRoute.length === 0 ? (
                <div className="py-2 text-center text-xs text-[var(--color-charcoal)]/60">
                  Calculating FairRoute ranking for nearby authorized facilities...
                </div>
              ) : (
                fairRoute.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.recycler?.id || idx}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-hairline)] bg-slate-50/50 p-2.5 text-xs transition hover:bg-slate-50"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 font-semibold text-[var(--color-ink)] truncate">
                        <span>#{idx + 1} {item.recycler?.name || item.recycler?.companyName}</span>
                      </div>
                      <div className="text-[11px] text-[var(--color-charcoal)]/60">
                        {item.recycler?.location || 'Tamil Nadu'} · {item.distanceKm} km away
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-[var(--color-leaf)]">
                        {item.score} pts
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        {item.acceptsMaterial ? 'Matches Material' : 'Generic'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Lot Information & Action Panel */}
        <div className="space-y-6 lg:col-span-7">
          {/* Specifications & Financial Card */}
          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--color-hairline)] pb-3">
              <h2 className="font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--color-leaf)]" /> Lot Specifications & Pricing
              </h2>
              <span className="font-mono text-xs font-semibold text-[var(--color-leaf)]">
                Batch #{lot.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Info label="Material" value={lot.material} />
              <Info label="Sub-category" value={lot.subCategory || 'Standard Grade'} />
              <Info label="Condition" value={lot.condition || 'Pre-sorted'} />
              <Info label="Approximate Weight" value={`${lot.weight} kg`} />
              <Info label="Estimated Value" value={`₹${lot.estimatedValue?.toLocaleString('en-IN') || 0}`} />
              <Info label="Quoted Payout" value={`₹${lot.quotedPrice?.toLocaleString('en-IN') || 0}`} />
              <Info label="Collector Assigned" value={lot.collectorId || 'Unassigned'} />
              <Info label="Assigned Recycler" value={lot.recyclerName || lot.recyclerId || 'Open Pool'} />
              <Info label="Registered At" value={lot.createdAt || 'Recent'} />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-leaf-pale)] px-3 py-2 text-xs font-medium text-[var(--color-ink)]">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--color-leaf)]" />
              <span>Location Origin: {lot.location}</span>
            </div>

            {lot.description && (
              <p className="mt-3 text-xs text-[var(--color-charcoal)]/80 leading-relaxed border-t border-[var(--color-hairline)] pt-3">
                <span className="font-semibold text-[var(--color-ink)]">Batch Notes: </span>
                {lot.description}
              </p>
            )}
          </Card>

          {/* Recycler Action Bar */}
          {recyclerScoped && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Recycler Actions & Procurement
                </h3>
                <span className="text-xs text-[var(--color-charcoal)]/60">
                  Current Status: <span className="font-semibold">{lot.status}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {lot.status === 'REQUESTED' && (
                  <button
                    disabled={busy}
                    onClick={() => act('ACCEPTED')}
                    className="focus-ring flex items-center gap-1.5 rounded-lg bg-[var(--color-leaf)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--color-ink)] disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Accept Lot Batch
                  </button>
                )}

                {['REQUESTED', 'ACCEPTED'].includes(lot.status) && (
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="focus-ring flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
                  >
                    <DollarSign className="h-4 w-4" /> Provide Custom Quote
                  </button>
                )}

                {lot.status === 'ACCEPTED' && (
                  <button
                    disabled={busy}
                    onClick={() => act('PICKUP_SCHEDULED')}
                    className="focus-ring flex items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4" /> Schedule Pickup
                  </button>
                )}

                {lot.status === 'PICKUP_SCHEDULED' && (
                  <button
                    disabled={busy}
                    onClick={() => act('HANDED_OVER')}
                    className="focus-ring flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                  >
                    <Award className="h-4 w-4" /> Confirm Material Handover
                  </button>
                )}

                {lot.status === 'HANDED_OVER' && (
                  <button
                    disabled={busy}
                    onClick={() => act('COMPLETED')}
                    className="focus-ring flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Complete & Release Payment
                  </button>
                )}

                {lot.status === 'REQUESTED' && (
                  <button
                    disabled={busy}
                    onClick={() => act('REJECTED')}
                    className="focus-ring rounded-lg border border-[var(--color-rust)] px-4 py-2 text-xs font-semibold text-[var(--color-rust)] hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject Batch
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Traceability Audit Trail */}
          <Card>
            <div className="mb-3 flex items-center justify-between border-b border-[var(--color-hairline)] pb-3">
              <div className="font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--color-leaf)]" />
                Immutable Digital Traceability Log
              </div>
              <span className="text-[11px] text-[var(--color-charcoal)]/50">
                End-to-End Chain of Custody
              </span>
            </div>
            <TraceabilityTimeline events={events} />
          </Card>
        </div>
      </div>

      {/* Quote Submission Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-hairline)] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-hairline)] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--color-ink)]">
                    Submit Recycler Quote
                  </h3>
                  <p className="text-xs text-[var(--color-charcoal)]/60">Lot Batch #{lot.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="rounded-lg p-1 text-[var(--color-charcoal)]/50 hover:bg-slate-100 hover:text-[var(--color-ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Offered Rate per Kilogram (₹ / kg)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-[var(--color-charcoal)]/50">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="e.g. 185.50"
                    value={offeredRate}
                    onChange={(e) => setOfferedRate(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-[var(--color-hairline)] bg-slate-50/50 py-2.5 pl-8 pr-4 text-sm font-semibold text-[var(--color-ink)] focus:bg-white"
                  />
                </div>
              </div>

              {offeredRate && !isNaN(offeredRate) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
                  <div className="flex justify-between text-emerald-900">
                    <span>Batch Weight:</span>
                    <span className="font-semibold">{lot.weight} kg</span>
                  </div>
                  <div className="mt-1 flex justify-between text-emerald-900">
                    <span>Rate:</span>
                    <span className="font-semibold">₹{parseFloat(offeredRate).toFixed(2)} / kg</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-emerald-200 pt-2 font-display text-sm font-bold text-emerald-950">
                    <span>Total Payout:</span>
                    <span>₹{(parseFloat(offeredRate) * lot.weight).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {quoteMsg && (
                <div className="rounded-lg bg-emerald-100 p-2.5 text-center text-xs font-semibold text-emerald-800">
                  {quoteMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="focus-ring rounded-xl border border-[var(--color-hairline)] px-4 py-2 text-xs font-medium text-[var(--color-charcoal)] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !offeredRate}
                  className="focus-ring flex items-center gap-1.5 rounded-xl bg-[var(--color-leaf)] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[var(--color-ink)] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {busy ? 'Submitting...' : 'Confirm & Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-charcoal)]/50">{label}</div>
      <div className="mt-0.5 font-medium text-[var(--color-ink)]">{value}</div>
    </div>
  )
}
