import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Eye, Power, Trash2, Copy, Check, ShieldCheck, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PageHeader } from '../../components/ui'
import * as api from '../../services/api'

export default function RecyclerManagement() {
  const nav = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  async function toggleStatus(r) {
    await api.updateRecyclerStatus(r.id, r.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
    setRefreshKey((k) => k + 1)
  }
  async function doDelete() {
    await api.deleteRecycler(confirmDelete.id)
    setConfirmDelete(null)
    setRefreshKey((k) => k + 1)
  }

  function copyPassword(pw) {
    navigator.clipboard.writeText(pw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns = [
    { key: 'id', header: 'Recycler ID', render: (r) => <span className="font-mono text-xs font-bold text-[var(--color-ink)] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">{r.id}</span> },
    { 
      key: 'name', 
      header: 'Authorized Facility / Company', 
      render: (r) => (
        <div>
          <div className="font-bold text-xs text-[var(--color-ink)]">{r.name}</div>
          <div className="text-[11px] text-[var(--color-charcoal)]/60">{r.authNumber || r.cpcbRegistrationId || r.location}</div>
        </div>
      ) 
    },
    { key: 'location', header: 'District / State', render: (r) => <span className="text-xs text-[var(--color-charcoal)]">{r.location}</span> },
    { key: 'authStatus', header: 'Authorization', render: (r) => <StatusBadge status={r.authStatus} /> },
    { 
      key: 'materialsAccepted', 
      header: 'Materials Accepted', 
      render: (r) => {
        const list = Array.isArray(r.materialsAccepted) ? r.materialsAccepted : [r.materialsAccepted]
        return <span className="text-xs text-[var(--color-charcoal)]/80 font-medium">{list.slice(0, 3).join(', ')}{list.length > 3 ? ` +${list.length - 3}` : ''}</span>
      } 
    },
    { key: 'pickupAvailable', header: 'Pickup', render: (r) => (r.pickupAvailable ? <span className="text-xs font-semibold text-emerald-700">Available</span> : <span className="text-xs text-slate-500">Drop-off</span>) },
    { key: 'accountStatus', header: 'Status', render: (r) => <StatusBadge status={r.accountStatus} /> },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-1.5">
          <button title="View Details" onClick={() => nav(`/admin/recyclers/${r.id}`)} className="focus-ring rounded-lg p-1.5 hover:bg-[var(--color-leaf-pale)] text-[var(--color-leaf)] transition-colors"><Eye className="h-4 w-4" /></button>
          <button title="Activate/Deactivate" onClick={() => toggleStatus(r)} className="focus-ring rounded-lg p-1.5 hover:bg-[var(--color-leaf-pale)] text-slate-600 transition-colors"><Power className="h-4 w-4" /></button>
          <button title="Delete" onClick={() => setConfirmDelete(r)} className="focus-ring rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Authorized facilities"
        title="Recycler Management"
        action={
          <button 
            onClick={() => setAddOpen(true)} 
            className="focus-ring flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Authorized Recycler
          </button>
        }
      />
      <DataTable
        key={refreshKey}
        fetcher={api.getRecyclers}
        columns={columns}
        filterConfig={[{ key: 'location', label: 'Location', options: api.locations }]}
        emptyLabel="No recyclers match your filters"
      />

      <AnimatePresence>
        {addOpen && (
          <AddRecyclerModal 
            onClose={() => setAddOpen(false)} 
            onCreated={(c) => { 
              setCredentials(c); 
              setAddOpen(false); 
              setRefreshKey((k) => k + 1) 
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ModalShell onClose={() => setConfirmDelete(null)}>
            <div className="p-6">
              <div className="font-display text-lg font-bold text-[var(--color-ink)]">Deactivate Recycler Account?</div>
              <p className="mt-2 text-xs text-[var(--color-charcoal)]/70 leading-relaxed">
                Are you sure you want to deactivate <b>{confirmDelete.id}</b>? Historical transactions and traceability records will remain safely preserved.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button onClick={() => setConfirmDelete(null)} className="focus-ring rounded-xl border border-[var(--color-hairline)] px-4 py-2 text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button onClick={doDelete} className="focus-ring rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm">Confirm Deactivation</button>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {credentials && (
          <ModalShell onClose={() => setCredentials(null)}>
            <div className="p-6">
              <div className="flex items-center gap-2.5 text-emerald-800 mb-1">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">Recycler Account Created</h3>
              </div>
              <p className="text-xs text-[var(--color-charcoal)]/70">
                A strong high-entropy password has been automatically generated for this recycler.
              </p>

              <div className="mt-4 space-y-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-charcoal)]/70">Facility Username:</span>
                  <span className="font-mono font-bold text-[var(--color-ink)] bg-white px-2 py-0.5 rounded border border-emerald-200">{credentials.record.username}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--color-charcoal)]/70">Generated Strong Password:</span>
                    <button
                      type="button"
                      onClick={() => copyPassword(credentials.generatedPassword)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Password'}</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-sm text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-300 break-all select-all">
                    {credentials.generatedPassword}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setCredentials(null)} 
                className="focus-ring mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalShell({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[var(--color-hairline)]"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function AddRecyclerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ 
    name: '', 
    location: 'Chennai, Tamil Nadu', 
    address: '', 
    materialsAccepted: ['PCB', 'Copper Wire', 'Mixed E-Waste'], 
    authNumber: '', 
    authStatus: 'AUTHORIZED', 
    contact: '', 
    offeredRate: '160', 
    pickupAvailable: true, 
    serviceArea: '25 km radius' 
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const created = await api.createRecycler({ 
      ...form, 
      materialsAccepted: form.materialsAccepted.length ? form.materialsAccepted : ['General'] 
    })
    setSaving(false)
    onCreated(created)
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--color-hairline)] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[var(--color-ink)]">Register Authorized Recycler</h3>
              <p className="text-[11px] text-[var(--color-charcoal)]/60">Creates facility account with strong credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Facility Name" value={form.name} onChange={set('name')} required placeholder="e.g. EcoGreen Tech Recyclers Pvt Ltd" />
          <Field label="District / Location" value={form.location} onChange={set('location')} required placeholder="e.g. Madurai, Tamil Nadu" />
          <Field label="Address" value={form.address} onChange={set('address')} placeholder="Industrial Estate, Phase II" />
          <Field label="CPCB / SPCB Authorization Number" value={form.authNumber} onChange={set('authNumber')} placeholder="e.g. TNPCB-AUTH-REC-2026" />
          <Field label="Official Phone" value={form.contact} onChange={set('contact')} placeholder="+91 98765 43210" />
          <Field label="Base Offered Rate (₹/kg)" value={form.offeredRate} onChange={set('offeredRate')} type="number" />
          <Field label="Service Area Radius" value={form.serviceArea} onChange={set('serviceArea')} placeholder="e.g. 25 km radius" />

          <button 
            disabled={saving} 
            type="submit" 
            className="focus-ring mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
          >
            {saving ? 'Registering Facility…' : 'Generate Account & Strong Credentials'}
          </button>
        </form>
      </div>
    </ModalShell>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/80">{label}</label>
      <input {...props} className="focus-ring w-full rounded-xl border border-[var(--color-hairline)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--color-ink)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
    </div>
  )
}
