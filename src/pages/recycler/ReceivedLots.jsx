import { Link } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../services/api'

export default function ReceivedLots() {
  const { session } = useAuth()
  const recyclerId = session?.profile?.id || session?.username || 'REC-2026-000001'

  const columns = [
    { key: 'id', header: 'Lot ID', render: (l) => <Link to={`/recycler/lots/${l.id}`} className="font-medium text-[var(--color-leaf)] hover:underline">{l.id}</Link> },
    { key: 'material', header: 'Material', render: (l) => l.material },
    { key: 'weight', header: 'Weight', render: (l) => `${l.weight} kg` },
    { key: 'location', header: 'Collection Location', render: (l) => l.location },
    { key: 'estimatedValue', header: 'Est. Value', render: (l) => `₹${(l.estimatedValue || 0).toLocaleString('en-IN')}` },
    { key: 'quotedPrice', header: 'Quoted Price', render: (l) => `₹${(l.quotedPrice || 0).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'action', header: '', render: (l) => <Link to={`/recycler/lots/${l.id}`} className="text-sm text-[var(--color-leaf)] hover:underline">View Details</Link> },
  ]

  return (
    <div>
      <PageHeader eyebrow="Only visible to you" title="Received Lots" />
      <DataTable
        fetcher={(opts) => api.getRecyclerLots(recyclerId, opts)}
        columns={columns}
        filterConfig={[{ key: 'material', label: 'Material', options: api.materials }, { key: 'status', label: 'Status', options: api.statuses }]}
        emptyLabel="No lot requests yet"
      />
    </div>
  )
}
