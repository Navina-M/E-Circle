import { Link } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import * as api from '../../services/api'

export default function AdminLots() {
  const columns = [
    { key: 'id', header: 'Lot ID', render: (l) => <Link to={`/admin/lots/${l.id}`} className="font-medium text-[var(--color-leaf)] hover:underline">{l.id}</Link> },
    { key: 'collectorId', header: 'Collector', render: (l) => l.collectorId },
    { key: 'material', header: 'Material', render: (l) => l.material },
    { key: 'weight', header: 'Weight', render: (l) => `${l.weight} kg` },
    { key: 'estimatedValue', header: 'Est. Value', render: (l) => `₹${l.estimatedValue.toLocaleString('en-IN')}` },
    { key: 'recyclerId', header: 'Recycler', render: (l) => l.recyclerId },
    { key: 'location', header: 'Location', render: (l) => l.location },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'createdAt', header: 'Date', render: (l) => l.createdAt },
  ]
  return (
    <div>
      <PageHeader eyebrow="Every lot on the platform" title="All Lots" />
      <DataTable
        fetcher={api.getLots}
        columns={columns}
        filterConfig={[
          { key: 'status', label: 'Status', options: api.statuses },
          { key: 'material', label: 'Material', options: api.materials },
          { key: 'location', label: 'Location', options: api.locations },
        ]}
      />
    </div>
  )
}
