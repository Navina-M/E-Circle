import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Card, PageHeader, Skeleton } from '../../components/ui'
import * as api from '../../services/api'

export default function ActivityLog() {
  const [items, setItems] = useState(null)
  useEffect(() => { api.getActivity({ page: 1, pageSize: 20 }).then((r) => setItems(r.items)) }, [])

  return (
    <div>
      <PageHeader eyebrow="Platform-wide" title="Activity" />
      <Card className="p-0">
        {!items ? <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
          <div>
            {items.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex items-start gap-3 border-b border-[var(--color-hairline)] px-4 py-3 last:border-0">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-leaf-pale)] text-[var(--color-leaf)]"><Activity className="h-3.5 w-3.5" /></span>
                <div className="flex-1 text-sm">
                  <span className="text-[var(--color-ink)]">{a.action} <span className="font-medium">{a.lotId}</span></span>
                  <div className="text-xs text-[var(--color-charcoal)]/50">{a.role} · {a.user} · {a.location} · {a.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
