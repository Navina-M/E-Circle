import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Sparkles, DollarSign, Layers, ArrowUpRight } from 'lucide-react'
import { Card, PageHeader, Skeleton, FadeIn } from '../../components/ui'
import * as api from '../../services/api'

export default function PriceBoard() {
  const [prices, setPrices] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => { 
    api.getPrices().then((p) => { 
      setPrices(p)
      if (p && p.length > 0) setSelected(p[0]) 
    }) 
  }, [])

  if (!prices) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader 
        eyebrow="Market Transparency Engine" 
        title="Live E-Waste Fair Pricing Board" 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prices.map((p) => {
          const isSelected = selected?.material === p.material
          return (
            <button 
              key={p.material} 
              onClick={() => setSelected(p)} 
              className="text-left focus:outline-none cursor-pointer"
            >
              <Card className={`relative overflow-hidden transition-all ${
                isSelected 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 shadow-md' 
                  : 'hover:border-emerald-300'
              }`}>
                {isSelected && (
                  <div className="absolute top-0 right-0 h-10 w-10 overflow-hidden">
                    <div className="absolute transform rotate-45 bg-emerald-600 text-white font-bold text-[9px] py-0.5 right-[-35px] top-[14px] w-[100px] text-center shadow-xs">
                      ACTIVE
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/60">
                      {p.subCategory || 'Grade A'}
                    </div>
                    <div className="font-display text-base font-bold text-[var(--color-ink)] mt-0.5">
                      {p.material}
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {p.location}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-emerald-800">
                    ₹{p.buyingPrice}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-charcoal)]/60">
                    /{p.unit}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-hairline)] pt-2 text-[11px] text-[var(--color-charcoal)]/70">
                  <span>Quoted: <b className="text-[var(--color-ink)]">₹{p.quotedPrice}</b></span>
                  <span className="text-[10px] font-medium text-emerald-700">Recycler Verified</span>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      {selected && (
        <FadeIn delay={0.1}>
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-hairline)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    Historical Benchmark — {selected.material}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    ₹{selected.buyingPrice} / {selected.unit}
                  </span>
                </div>
                <div className="text-xs text-[var(--color-charcoal)]/60 mt-0.5">
                  12-cycle pricing trend recorded from {selected.recycler} in {selected.location}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Fair Pricing Index</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected.history.map((v, i) => ({ cycle: `T-${12 - i}`, price: v }))}>
                  <defs>
                    <linearGradient id="priceBoardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#D0E4D9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="cycle" tick={{ fontSize: 12, fill: '#23372E' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#23372E' }} axisLine={false} tickLine={false} width={45} />
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
                  <Area type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#priceBoardGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
