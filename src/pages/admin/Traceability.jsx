import { useEffect, useState } from 'react'
import { Card, PageHeader, SearchInput, Skeleton } from '../../components/ui'
import TraceabilityTimeline from '../../components/TraceabilityTimeline'
import * as api from '../../services/api'

export default function AdminTraceability() {
  const [lots, setLots] = useState([])
  const [selected, setSelected] = useState(null)
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { api.getLots({ page: 1, pageSize: 8, search }).then((r) => { setLots(r.items); if (!selected && r.items[0]) pick(r.items[0]) }) }, [search])

  async function pick(lot) {
    setSelected(lot)
    setEvents(await api.getLotTraceability(lot.id))
  }

  return (
    <div>
      <PageHeader eyebrow="Digital proof of custody" title="Traceability" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-1">
          <div className="border-b border-[var(--color-hairline)] p-3"><SearchInput value={search} onChange={setSearch} placeholder="Search lot ID" /></div>
          <div className="max-h-[520px] overflow-y-auto">
            {lots.map((l) => (
              <button key={l.id} onClick={() => pick(l)} className={`focus-ring block w-full border-b border-[var(--color-hairline)] px-4 py-3 text-left text-sm last:border-0 hover:bg-[var(--color-leaf-pale)]/50 ${selected?.id === l.id ? 'bg-[var(--color-leaf-pale)]' : ''}`}>
                <div className="font-medium text-[var(--color-ink)]">{l.id}</div>
                <div className="text-xs text-[var(--color-charcoal)]/60">{l.material} · {l.weight} kg</div>
              </button>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          {!selected ? <Skeleton className="h-64 w-full" /> : (
            <>
              <div className="mb-4 font-display text-lg font-semibold text-[var(--color-ink)]">{selected.id} <span className="ml-2 text-sm font-normal text-[var(--color-charcoal)]/60">{selected.material} · {selected.weight} kg</span></div>
              <TraceabilityTimeline events={events} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
