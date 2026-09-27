import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import * as api from '../../services/api'

export default function CollectorMonitoring() {
  const nav = useNavigate()
  const columns = [
    { key: 'id', header: 'Collector ID', render: (c) => <span className="font-medium text-[var(--color-ink)]">{c.id}</span> },
    { key: 'language', header: 'Language', render: (c) => c.language },
    { key: 'location', header: 'Operating Location', render: (c) => c.location },
    { key: 'totalLots', header: 'Total Lots', render: (c) => c.totalLots },
    { key: 'totalTransactions', header: 'Transactions', render: (c) => c.totalTransactions },
    { key: 'totalEarnings', header: 'Earnings', render: (c) => `₹${c.totalEarnings.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'action', header: '', render: (c) => <button onClick={() => nav(`/admin/collectors/${c.id}`)} className="focus-ring flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--color-leaf)] hover:bg-[var(--color-leaf-pale)]"><Eye className="h-3.5 w-3.5" /> View</button> },
  ]
  return (
    <div>
      <PageHeader eyebrow="Monitoring only — no delete access" title="Collector Activity" />
      <DataTable fetcher={api.getCollectors} columns={columns} filterConfig={[{ key: 'location', label: 'Location', options: api.locations }]} />
    </div>
  )
}
