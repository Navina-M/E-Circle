import AUTHORIZED_RECYCLERS from '../data/authorized_recyclers.json'

const MATERIALS = ['PCB', 'Cables', 'Copper', 'Aluminium', 'Metals', 'Plastics', 'Iron', 'Mixed E-Waste', 'Batteries', 'Glass', 'Precious Metals']
const LOCATIONS = Array.from(new Set(AUTHORIZED_RECYCLERS.map((r) => r.district || r.location).filter(Boolean)))
const STATUSES = ['CREATED', 'AI_VERIFIED', 'MATCHED', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'PICKUP_SCHEDULED', 'HANDED_OVER', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED']

function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = seededRand(42)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const pad = (n, len) => String(n).padStart(len, '0')

export const RECYCLERS = AUTHORIZED_RECYCLERS

export const COLLECTORS = Array.from({ length: 22 }).map((_, i) => {
  const id = `COL-2026-${pad(i + 1, 6)}`
  return {
    id,
    language: pick(['Tamil', 'Hindi', 'English', 'Telugu']),
    location: pick(LOCATIONS),
    totalLots: 3 + Math.floor(rand() * 40),
    totalTransactions: 2 + Math.floor(rand() * 35),
    totalEarnings: Math.round(1500 + rand() * 45000),
    status: rand() > 0.25 ? 'ACTIVE' : 'INACTIVE',
    lastActivity: `2026-09-${pad(1 + Math.floor(rand() * 13), 2)}`,
  }
})

function makeLot(i) {
  const id = `LOT-2026-${pad(i + 1, 6)}`
  const material = pick(MATERIALS)
  const status = pick(STATUSES)
  const weight = +(1 + rand() * 25).toFixed(1)
  const rate = Math.round(60 + rand() * 420)
  const recycler = pick(RECYCLERS)
  const collector = pick(COLLECTORS)
  return {
    id,
    collectorId: collector.id,
    material,
    subCategory: pick(['Mixed', 'Grade A', 'Grade B', 'Sorted']),
    description: `${material} recovered from decommissioned equipment, visually sorted on-site.`,
    weight,
    condition: pick(['Good', 'Fair', 'Damaged', 'Mixed']),
    aiConfidence: +(78 + rand() * 21).toFixed(1),
    estimatedValue: Math.round(weight * rate),
    quotedPrice: Math.round(weight * rate * (0.9 + rand() * 0.25)),
    finalValue: status === 'COMPLETED' ? Math.round(weight * rate * (0.9 + rand() * 0.25)) : null,
    location: pick(LOCATIONS),
    lat: 9.45 + rand() * 0.9,
    lng: 77.3 + rand() * 0.9,
    recyclerId: recycler.id,
    recyclerName: recycler.name,
    status,
    createdAt: `2026-09-${pad(1 + Math.floor(rand() * 13), 2)} ${pad(Math.floor(rand() * 24), 2)}:${pad(Math.floor(rand() * 60), 2)}`,
  }
}
export const LOTS = Array.from({ length: 60 }).map((_, i) => makeLot(i))

export const TRANSACTIONS = LOTS.filter((_, i) => i % 2 === 0).map((lot, i) => ({
  id: `TXN-2026-${pad(i + 1, 6)}`,
  lotId: lot.id,
  collectorId: lot.collectorId,
  recyclerId: lot.recyclerId,
  material: lot.material,
  weight: lot.weight,
  quotedPrice: lot.quotedPrice,
  finalPrice: lot.finalValue ?? lot.quotedPrice,
  paymentStatus: pick(['PAID', 'PENDING', 'PAID', 'PAID']),
  paymentMethod: pick(['Cash', 'Digital']),
  collectionLocation: lot.location,
  handoverLocation: pick(RECYCLERS).location,
  date: lot.createdAt,
  status: pick(['COMPLETED', 'PROCESSING', 'COMPLETED']),
}))

const TRACE_STEPS = ['LOT CREATED', 'PHOTO CAPTURED', 'AI MATERIAL VERIFIED', 'LOCATION RECORDED', 'VALUE ESTIMATED', 'RECYCLER MATCHED', 'REQUEST SENT', 'RECYCLER ACCEPTED', 'PICKUP', 'HANDOVER', 'RECYCLER CONFIRMATION', 'PAYMENT', 'COMPLETED']
export function traceabilityFor(lot) {
  const statusIndex = STATUSES.indexOf(lot.status)
  const completedCount = Math.max(1, Math.min(TRACE_STEPS.length, Math.round((statusIndex / STATUSES.length) * TRACE_STEPS.length) + 2))
  return TRACE_STEPS.map((label, i) => ({
    id: `TRC-2026-${pad(i + 1, 6)}`,
    label,
    done: i < completedCount,
    active: i === completedCount,
    timestamp: i < completedCount ? `2026-09-${pad(1 + i, 2)} ${pad(8 + i, 2)}:${pad((i * 7) % 60, 2)}` : null,
    location: lot.location,
    weight: lot.weight,
    responsible: i < 7 ? lot.collectorId : lot.recyclerId,
  }))
}

export const PRICES = MATERIALS.map((m, i) => ({
  material: m,
  subCategory: pick(['Mixed', 'Grade A', 'Sorted']),
  location: pick(LOCATIONS),
  buyingPrice: Math.round(60 + rand() * 420),
  quotedPrice: Math.round(70 + rand() * 460),
  unit: 'kg',
  recycler: pick(RECYCLERS).name,
  lastUpdated: '2026-09-13',
  history: Array.from({ length: 12 }).map((_, m2) => Math.round(80 + rand() * 380 + Math.sin(m2 / 2) * 30)),
}))

export const ACTIVITY = Array.from({ length: 30 }).map((_, i) => {
  const lot = pick(LOTS)
  const actions = [
    `Collector ${lot.collectorId} created lot`,
    `Recycler ${lot.recyclerId} received request for`,
    `Recycler ${lot.recyclerId} accepted`,
    `Pickup scheduled for`,
    `Handover confirmed for`,
    `Payment completed for`,
  ]
  return {
    id: `ACT-${pad(i + 1, 5)}`,
    user: rand() > 0.5 ? lot.collectorId : lot.recyclerId,
    role: rand() > 0.5 ? 'Collector' : 'Recycler',
    action: pick(actions),
    lotId: lot.id,
    timestamp: `2026-09-${pad(1 + Math.floor(rand() * 13), 2)} ${pad(Math.floor(rand() * 24), 2)}:${pad(Math.floor(rand() * 60), 2)}`,
    location: lot.location,
  }
})

export const NOTIFICATIONS = [
  { id: 1, title: 'New Lot Request', detail: LOTS[0].id, read: false, time: '5m ago' },
  { id: 2, title: 'Pickup scheduled', detail: LOTS[3].id, read: false, time: '1h ago' },
  { id: 3, title: 'Handover confirmed', detail: LOTS[5].id, read: true, time: '3h ago' },
  { id: 4, title: 'Payment completed', detail: TRANSACTIONS[0]?.id, read: true, time: 'Yesterday' },
]

export const STATUS_LIST = STATUSES
export const MATERIAL_LIST = MATERIALS
export const LOCATION_LIST = LOCATIONS
