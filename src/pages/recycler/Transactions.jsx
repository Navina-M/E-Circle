import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../services/api'

export default function RecyclerTransactions() {
  const { session } = useAuth()
  const recyclerId = session.profile.id

  const columns = [
    { key: 'id', header: 'Transaction ID', render: (t) => <span className="font-medium text-[var(--color-ink)]">{t.id}</span> },
    { key: 'lotId', header: 'Lot ID', render: (t) => t.lotId },
    { key: 'material', header: 'Material', render: (t) => t.material },
    { key: 'weight', header: 'Weight', render: (t) => `${t.weight} kg` },
    { key: 'quotedPrice', header: 'Quoted', render: (t) => `₹${t.quotedPrice.toLocaleString('en-IN')}` },
    { key: 'finalPrice', header: 'Final', render: (t) => `₹${t.finalPrice.toLocaleString('en-IN')}` },
    { key: 'paymentStatus', header: 'Payment', render: (t) => <StatusBadge status={t.paymentStatus} /> },
    { key: 'date', header: 'Date', render: (t) => t.date },
  ]

  return (
    <div>
      <PageHeader eyebrow="Your records only" title="Transactions" />
      <DataTable
        fetcher={async (opts) => {
          const all = await api.getTransactions({ ...opts, pageSize: 200 })
          const mine = all.items.filter((t) => t.recyclerId === recyclerId)
          const page = opts.page || 1, pageSize = 8
          return { items: mine.slice((page - 1) * pageSize, page * pageSize), total: mine.length, totalPages: Math.max(1, Math.ceil(mine.length / pageSize)) }
        }}
        columns={columns}
      />
    </div>
  )
}
