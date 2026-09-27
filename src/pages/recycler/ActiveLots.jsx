import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, Skeleton, EmptyState } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../services/api'

const STEPS = ['ACCEPTED', 'PICKUP_SCHEDULED', 'HANDED_OVER', 'PAYMENT_PENDING', 'COMPLETED']

export default function ActiveLots() {
  const { session } = useAuth()
  const recyclerId = session?.profile?.id || session?.username || 'REC-2026-000001'
  const [lots, setLots] = useState(null)

  useEffect(() => {
    if (!recyclerId) return
    api.getRecyclerLots(recyclerId, { page: 1, pageSize: 50 })
      .then((r) => setLots((r.items || []).filter((l) => STEPS.includes(l.status))))
      .catch(() => setLots([]))
  }, [recyclerId])

  return (
    <div>
      <PageHeader eyebrow="In progress" title="Active Lots" />
      {!lots ? <Skeleton className="h-48 w-full" /> : lots.length === 0 ? <EmptyState title="No active lots right now" /> : (
        <div className="space-y-3">
          {lots.map((l) => {
            const idx = STEPS.indexOf(l.status)
            return (
              <Card key={l.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <Link to={`/recycler/lots/${l.id}`} className="font-display font-semibold text-[var(--color-ink)] hover:text-[var(--color-leaf)]">{l.id}</Link>
                    <span className="ml-2 text-sm text-[var(--color-charcoal)]/60">{l.material} · {l.weight} kg</span>
                  </div>
                  <span className="text-sm text-[var(--color-charcoal)]/50">{l.location}</span>
                </div>
                <div className="flex items-center">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i <= idx ? 'bg-[var(--color-leaf)] text-white' : 'bg-[var(--color-hairline)] text-[var(--color-charcoal)]/40'}`}>{i + 1}</div>
                      {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < idx ? 'bg-[var(--color-leaf)]' : 'bg-[var(--color-hairline)]'}`} />}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-[var(--color-charcoal)]/50">
                  {STEPS.map((s) => <span key={s}>{s.replaceAll('_', ' ')}</span>)}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
