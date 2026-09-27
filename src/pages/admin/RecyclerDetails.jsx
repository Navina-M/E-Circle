import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Mail, Globe, ShieldCheck, Award, Building, Truck } from 'lucide-react'
import { Card, PageHeader, Skeleton } from '../../components/ui'
import StatusBadge from '../../components/StatusBadge'
import * as api from '../../services/api'

export default function RecyclerDetails() {
  const { id } = useParams()
  const nav = useNavigate()
  const [r, setR] = useState(null)

  useEffect(() => { api.getRecycler(id).then(setR) }, [id])

  if (!r) return <Skeleton className="h-64 w-full" />

  const mats = Array.isArray(r.materialsAccepted) ? r.materialsAccepted.join(', ') : (r.materialsAccepted || 'Mixed E-Waste')
  const eee = Array.isArray(r.eeeCategories) ? r.eeeCategories.join(', ') : (r.eeeCategories || 'IT Equipment')

  return (
    <div>
      <button onClick={() => nav(-1)} className="focus-ring mb-4 flex items-center gap-1.5 text-sm text-[var(--color-charcoal)]/70 hover:text-[var(--color-ink)]">
        <ArrowLeft className="h-4 w-4" /> Back to recyclers
      </button>
      <PageHeader 
        eyebrow={`Authorized Recycler · ${r.id}`} 
        title={r.companyName || r.name} 
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={r.authStatus || 'AUTHORIZED'} />
            <StatusBadge status={r.accountStatus || 'ACTIVE'} />
          </div>
        } 
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="mb-3 font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--color-leaf)]" /> Authorization & Compliance
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="CPCB / Auth Registration No." value={r.cpcbRegistrationId || r.authNumber || 'TNPCB-AUTH-1000'} />
            <Info label="SPCB Authority" value={r.spcbName || 'Pollution Control Board'} />
            <Info label="Registration Status" value={r.cpcbRegistrationStatus || 'Authorized / Registered'} />
            <Info label="Registration Valid Until" value={r.registrationValidUntil || '2030-01-01'} />
            <Info label="Annual Processing Capacity" value={r.processingCapacityMtPerYear ? `${r.processingCapacityMtPerYear.toLocaleString()} MT / year` : 'Standard'} />
            <Info label="Data Confidence Score" value={`${Math.round((r.dataConfidence || 0.85) * 100)}% Match`} />
          </div>

          <div className="my-5 border-t border-[var(--color-hairline)]" />

          <div className="mb-3 font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
            <Award className="h-4 w-4 text-[var(--color-leaf)]" /> Materials & Operations
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Materials Accepted" value={mats} />
            <Info label="EEE Categories" value={eee} />
            <Info label="Offered Rate" value={`₹${r.offeredRate || 150}/kg (${r.priceMaterial || 'Mixed'})`} />
            <Info label="Minimum Lot Quantity" value={r.minimumQuantityKg ? `${r.minimumQuantityKg} kg` : 'None (Any lot size)'} />
            <Info label="Pickup Availability" value={r.pickupAvailable ? 'Pickup available' : 'Drop-off only'} />
            <Info label="Service Area" value={r.serviceArea || `${r.location} region`} />
          </div>
        </Card>

        <Card>
          <div className="mb-3 font-display text-sm font-semibold text-[var(--color-ink)] flex items-center gap-2">
            <Building className="h-4 w-4 text-[var(--color-leaf)]" /> Facility & Contact
          </div>
          <div className="space-y-3.5 text-sm">
            {r.facilityName && r.facilityName !== r.name && (
              <div>
                <div className="text-xs text-[var(--color-charcoal)]/50">Facility Name</div>
                <div className="font-medium text-[var(--color-ink)]">{r.facilityName}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-[var(--color-charcoal)]/50">Address / Location</div>
              <div className="flex items-start gap-2 text-[var(--color-charcoal)] mt-1">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-leaf)] mt-0.5" /> 
                <span>{r.facilityAddress || r.location}{r.pincode ? ` - ${r.pincode}` : ''}</span>
              </div>
            </div>
            {r.contactPerson && (
              <div>
                <div className="text-xs text-[var(--color-charcoal)]/50">Contact Person</div>
                <div className="font-medium text-[var(--color-ink)]">{r.contactPerson}</div>
              </div>
            )}
            <div className="flex items-center gap-2 text-[var(--color-charcoal)]">
              <Phone className="h-4 w-4 shrink-0 text-[var(--color-leaf)]" /> 
              <span>{r.officialPhone || r.contact || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-charcoal)]">
              <Mail className="h-4 w-4 shrink-0 text-[var(--color-leaf)]" /> 
              <span className="truncate">{r.officialEmail || r.email || 'info@ecircle.org'}</span>
            </div>
            {r.website && (
              <div className="flex items-center gap-2 text-[var(--color-charcoal)]">
                <Globe className="h-4 w-4 shrink-0 text-[var(--color-leaf)]" /> 
                <a href={r.website} target="_blank" rel="noreferrer" className="truncate text-[var(--color-leaf)] hover:underline">{r.website}</a>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value, children }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-charcoal)]/50">{label}</div>
      <div className="mt-0.5 font-medium text-[var(--color-ink)]">{children || value}</div>
    </div>
  )
}
