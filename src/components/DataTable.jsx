import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, SearchInput, Select, Pagination, EmptyState, ErrorState, Skeleton } from './ui'

export default function DataTable({ fetcher, columns, filterConfig = [], rowKey = 'id', emptyLabel = 'No records found' }) {
  const [state, setState] = useState({ items: [], total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetcher({ page, pageSize: 8, search, ...filters })
      setState(res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [fetcher, page, search, filters])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  useEffect(() => { setPage(1) }, [search, filters])

  return (
    <Card className="p-0 overflow-hidden" hover={false}>
      {/* Table Header Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-hairline)] bg-slate-50/50 p-4">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[260px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search registry..." />
          {filterConfig.map((f) => (
            <Select
              key={f.key}
              value={filters[f.key] || ''}
              onChange={(v) => setFilters((s) => ({ ...s, [f.key]: v }))}
              options={f.options}
              placeholder={f.label}
            />
          ))}
        </div>

        {state.total !== undefined && (
          <div className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-200">
            {state.total} records found
          </div>
        )}
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : loading ? (
        <div className="space-y-2.5 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : state.items.length === 0 ? (
        <EmptyState title={emptyLabel} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[var(--color-hairline)] bg-emerald-50/40 text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/70">
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-3.5">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.items.map((row, i) => (
                <motion.tr
                  key={row[rowKey]}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.02 }}
                  className="border-b border-[var(--color-hairline)]/70 last:border-0 hover:bg-emerald-50/30 transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3.5">
                      {c.render(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-slate-50/30 border-t border-[var(--color-hairline)]/60">
        <Pagination page={page} totalPages={state.totalPages} onChange={setPage} />
      </div>
    </Card>
  )
}
