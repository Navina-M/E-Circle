import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import * as api from '../../services/api'

export default function AdminTransactions() {
  const columns = [
    { key: 'id', header: 'Transaction ID', render: (t) => <span className="font-medium text-[var(--color-ink)]">{t.id}</span> },
    { key: 'lotId', header: 'Lot ID', render: (t) => t.lotId },
    { key: 'material', header: 'Material', render: (t) => t.material },
    { key: 'weight', header: 'Weight', render: (t) => `${t.weight} kg` },
    { key: 'finalPrice', header: 'Final Price', render: (t) => `₹${t.finalPrice.toLocaleString('en-IN')}` },
    { key: 'paymentStatus', header: 'Payment', render: (t) => <StatusBadge status={t.paymentStatus} /> },
    { key: 'paymentMethod', header: 'Method', render: (t) => t.paymentMethod },
    { key: 'date', header: 'Date', render: (t) => t.date },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ]
  return (
    <div>
      <PageHeader eyebrow="Platform-wide" title="Transactions" />
      <DataTable fetcher={api.getTransactions} columns={columns} filterConfig={[{ key: 'status', label: 'Status', options: ['COMPLETED', 'PROCESSING'] }]} />
    </div>
  )
}
