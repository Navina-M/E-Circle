import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, PageHeader, Skeleton, EmptyState } from '../../components/ui'
import StatusBadge from '../../components/StatusBadge'
import * as api from '../../services/api'

export default function CollectorDetails() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => { api.getCollector(id).then(setData) }, [id])

  if (!data) return <Skeleton className="h-64 w-full" />
  const { collector, lots } = data

  return (
    <div>
      <button onClick={() => nav(-1)} className="focus-ring mb-4 flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]/70 hover:text-[var(--color-ink)]">
        <ArrowLeft className="h-4 w-4" /> Back to collector activity
      </button>
      <PageHeader eyebrow={collector.id} title={`Collector Activity — ${collector.language} speaker`} action={<StatusBadge status={collector.status} />} />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><div className="text-2xl font-display font-semibold">{collector.totalLots}</div><div className="text-sm text-[var(--color-charcoal)]/60">Total lots</div></Card>
        <Card><div className="text-2xl font-display font-semibold">{collector.totalTransactions}</div><div className="text-sm text-[var(--color-charcoal)]/60">Transactions</div></Card>
        <Card><div className="text-2xl font-display font-semibold">₹{collector.totalEarnings.toLocaleString('en-IN')}</div><div className="text-sm text-[var(--color-charcoal)]/60">Earnings</div></Card>
        <Card><div className="text-2xl font-display font-semibold">{collector.location}</div><div className="text-sm text-[var(--color-charcoal)]/60">Operating area</div></Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-[var(--color-hairline)] p-4 font-display text-sm font-semibold">Recent lots</div>
        {lots.length === 0 ? <EmptyState title="No lots from this collector yet" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-hairline)] text-left text-xs uppercase tracking-wide text-[var(--color-charcoal)]/50">
                <th className="px-4 py-3">Lot ID</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">Est. Value</th><th className="px-4 py-3">Recycler</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr key={l.id} className="border-b border-[var(--color-hairline)] last:border-0 hover:bg-[var(--color-leaf-pale)]/40">
                  <td className="px-4 py-3"><Link to={`/admin/lots/${l.id}`} className="font-medium text-[var(--color-leaf)] hover:underline">{l.id}</Link></td>
                  <td className="px-4 py-3">{l.material}</td>
                  <td className="px-4 py-3">{l.weight} kg</td>
                  <td className="px-4 py-3">₹{l.estimatedValue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{l.recyclerId}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
