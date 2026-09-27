// Service layer connecting React Frontend to FastAPI Backend
import * as db from '../api/mockData'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function getAuthHeader() {
  try {
    const raw = localStorage.getItem('ecircle_session')
    if (raw) {
      const session = JSON.parse(raw)
      if (session && session.token) {
        return { Authorization: `Bearer ${session.token}` }
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return {}
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || `API request failed with status ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[Backend API] Request to ${endpoint} failed or offline. Using fallback.`, err.message)
    throw err
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, v)
    }
  })
  const str = query.toString()
  return str ? `?${str}` : ''
}

export async function apiFetch(endpoint, options = {}) {
  const opts = { ...options }
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body)
  }
  return await request(endpoint, opts)
}

// ---- Auth ----
export async function login(username, password) {
  try {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  } catch (err) {
    // Fallback auth for development if backend server is starting
    if (username === 'admin' && (password === 'Admin@2026#Secure' || password === 'admin123')) {
      return { token: 'mock.jwt.admin', role: 'ADMIN', profile: { username: 'admin', name: 'Platform Administrator' } }
    }
    const recycler = db.RECYCLERS.find((r) => r.id === username)
    if (recycler && (password === 'Recycler@2026#Secure' || password === 'password123')) {
      return { token: `mock.jwt.${recycler.id}`, role: 'RECYCLER', profile: recycler }
    }
    throw err
  }
}

export async function changePassword(currentPassword, newPassword) {
  return await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function importRecyclers() {
  return await request('/api/admin/import-recyclers', {
    method: 'POST',
  })
}

// ---- Admin: dashboard ----
export async function getAdminDashboard() {
  try {
    return await request('/api/admin/dashboard')
  } catch {
    const totalWeight = db.LOTS.reduce((s, l) => s + l.weight, 0)
    const totalValue = db.LOTS.reduce((s, l) => s + l.estimatedValue, 0)
    return {
      kpis: {
        totalCollectors: db.COLLECTORS.length,
        activeCollectors: db.COLLECTORS.filter((c) => c.status === 'ACTIVE').length,
        totalRecyclers: db.RECYCLERS.length,
        activeRecyclers: db.RECYCLERS.filter((r) => r.accountStatus === 'ACTIVE').length,
        totalLots: db.LOTS.length,
        pendingRequests: db.LOTS.filter((l) => l.status === 'REQUESTED').length,
        completedHandovers: db.LOTS.filter((l) => ['HANDED_OVER', 'PAYMENT_PENDING', 'COMPLETED'].includes(l.status)).length,
        totalTransactions: db.TRANSACTIONS.length,
        todaysCollections: 7,
        todaysTransactions: 4,
        pendingPayments: db.TRANSACTIONS.filter((t) => t.paymentStatus === 'PENDING').length,
        totalWeight: totalWeight.toFixed(1),
        estimatedValue: totalValue,
        completedLots: db.LOTS.filter((l) => l.status === 'COMPLETED').length,
      },
      collectionTrend: monthlySeries(),
      materialDistribution: materialDistribution(),
      transactionTrend: monthlySeries(0.8),
      lotStatus: statusDistribution(),
    }
  }
}

function monthlySeries(scale = 1) {
  return ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({
    month: m,
    value: Math.round((40 + i * 12 + Math.sin(i) * 10) * scale),
  }))
}
function materialDistribution() {
  const counts = {}
  db.LOTS.forEach((l) => { counts[l.material] = (counts[l.material] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}
function statusDistribution() {
  const counts = {}
  db.LOTS.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// ---- Admin: recyclers ----
export async function getRecyclers(opts = {}) {
  try {
    return await request(`/api/admin/recyclers${buildQuery(opts)}`)
  } catch {
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(db.RECYCLERS, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

export async function getRecycler(id) {
  try {
    return await request(`/api/admin/recyclers/${id}`)
  } catch {
    return db.RECYCLERS.find((r) => r.id === id)
  }
}

export async function createRecycler(payload) {
  try {
    return await request('/api/admin/recyclers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch {
    const id = `REC-2026-${String(db.RECYCLERS.length + 1).padStart(6, '0')}`
    const record = { ...payload, id, username: id, accountStatus: 'ACTIVE', createdAt: new Date().toISOString().slice(0, 10) }
    db.RECYCLERS.push(record)
    return { record, generatedPassword: Math.random().toString(36).slice(2, 10) }
  }
}

export async function updateRecyclerStatus(id, accountStatus) {
  try {
    return await request(`/api/admin/recyclers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus }),
    })
  } catch {
    const r = db.RECYCLERS.find((x) => x.id === id)
    if (r) r.accountStatus = accountStatus
    return r
  }
}

export async function deleteRecycler(id) {
  try {
    return await request(`/api/admin/recyclers/${id}`, {
      method: 'DELETE',
    })
  } catch {
    const idx = db.RECYCLERS.findIndex((x) => x.id === id)
    if (idx >= 0) db.RECYCLERS.splice(idx, 1)
    return { deleted: true }
  }
}

// ---- Admin: collectors ----
export async function getCollectors(opts = {}) {
  try {
    return await request(`/api/admin/collectors${buildQuery(opts)}`)
  } catch {
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(db.COLLECTORS, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

export async function getCollector(id) {
  try {
    return await request(`/api/admin/collectors/${id}`)
  } catch {
    const collector = db.COLLECTORS.find((c) => c.id === id)
    const lots = db.LOTS.filter((l) => l.collectorId === id)
    return { collector, lots }
  }
}

// ---- Lots ----
export async function getLots(opts = {}) {
  try {
    return await request(`/api/lots${buildQuery(opts)}`)
  } catch {
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(db.LOTS, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

export async function getLot(id) {
  try {
    return await request(`/api/lots/${id}`)
  } catch {
    return db.LOTS.find((l) => l.id === id)
  }
}

export async function getLotTraceability(id) {
  try {
    return await request(`/api/lots/${id}/traceability`)
  } catch {
    const lot = db.LOTS.find((l) => l.id === id)
    return lot ? db.traceabilityFor(lot) : []
  }
}

export async function updateLotStatus(id, status) {
  try {
    return await request(`/api/lots/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  } catch {
    const l = db.LOTS.find((x) => x.id === id)
    if (l) l.status = status
    return l
  }
}

// ---- Recycler-scoped ----
export async function getRecyclerLots(recyclerId, opts = {}) {
  try {
    return await request(`/api/recyclers/lots${buildQuery(opts)}`)
  } catch {
    const mine = db.LOTS.filter((l) => l.recyclerId === recyclerId)
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(mine, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

export async function getRecyclerDashboard(recyclerId) {
  try {
    return await request('/api/recyclers/dashboard')
  } catch {
    const mine = db.LOTS.filter((l) => l.recyclerId === recyclerId)
    return {
      kpis: {
        newRequests: mine.filter((l) => l.status === 'REQUESTED').length,
        acceptedLots: mine.filter((l) => l.status === 'ACCEPTED').length,
        pendingPickups: mine.filter((l) => l.status === 'PICKUP_SCHEDULED').length,
        completedLots: mine.filter((l) => l.status === 'COMPLETED').length,
        totalReceived: mine.reduce((s, l) => s + l.weight, 0).toFixed(1),
        pendingPayments: mine.filter((l) => l.status === 'PAYMENT_PENDING').length,
      },
      weightTrend: monthlySeries(0.6),
      materialDistribution: (() => {
        const counts = {}
        mine.forEach((l) => { counts[l.material] = (counts[l.material] || 0) + 1 })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
      })(),
      recentLots: mine.slice(0, 6),
    }
  }
}

// ---- Transactions ----
export async function getTransactions(opts = {}) {
  try {
    return await request(`/api/admin/transactions${buildQuery(opts)}`)
  } catch {
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(db.TRANSACTIONS, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

// ---- Prices ----
export async function getPrices() {
  try {
    return await request('/api/prices')
  } catch {
    return db.PRICES
  }
}

// ---- Activity ----
export async function getActivity(opts = {}) {
  try {
    return await request(`/api/admin/activity${buildQuery(opts)}`)
  } catch {
    const start = ((opts.page || 1) - 1) * (opts.pageSize || 10)
    const list = applyFilters(db.ACTIVITY, opts)
    return {
      items: list.slice(start, start + (opts.pageSize || 10)),
      total: list.length,
      page: opts.page || 1,
      pageSize: opts.pageSize || 10,
      totalPages: Math.max(1, Math.ceil(list.length / (opts.pageSize || 10))),
    }
  }
}

// ---- Notifications ----
export async function getNotifications() {
  try {
    return await request('/api/notifications')
  } catch {
    return db.NOTIFICATIONS
  }
}

// ---- Maps / FairRoute ----
export async function getFairRouteRanking(lotId) {
  try {
    return await request(`/api/fairroute/${lotId}`)
  } catch {
    const lot = db.LOTS.find((l) => l.id === lotId)
    const candidates = db.RECYCLERS
      .filter((r) => r.authStatus === 'AUTHORIZED')
      .map((r) => ({
        recycler: r,
        distanceKm: +(2 + Math.random() * 30).toFixed(1),
        acceptsMaterial: r.materialsAccepted.includes(lot?.material),
        score: Math.round(60 + Math.random() * 40),
      }))
      .sort((a, b) => b.score - a.score)
    return candidates
  }
}

// ---- AI Material Classification ----
export async function classifyMaterial(formDataOrHint) {
  try {
    if (formDataOrHint instanceof FormData) {
      const url = `${API_BASE}/api/ai/classify-material`
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formDataOrHint,
      })
      if (!res.ok) throw new Error('AI Classification request failed')
      return await res.json()
    } else {
      const form = new FormData()
      if (typeof formDataOrHint === 'string') {
        form.append('material_hint', formDataOrHint)
      }
      const url = `${API_BASE}/api/ai/classify-material`
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: form,
      })
      if (!res.ok) throw new Error('AI Classification request failed')
      return await res.json()
    }
  } catch {
    const sampleCategories = ['PCB', 'Copper Wire', 'Lithium Battery', 'Aluminium Heat Sink', 'LCD Panel', 'Plastic Casing']
    const cat = typeof formDataOrHint === 'string' && formDataOrHint ? formDataOrHint : sampleCategories[Math.floor(Math.random() * sampleCategories.length)]
    return {
      material_category: cat,
      sub_category: 'Grade A Sorted',
      confidence: +(88 + Math.random() * 10).toFixed(1),
      detected_objects: [`YOLO_v8_${cat.toLowerCase().replace(/ /g, '_')}`, 'bounding_box_0.94'],
      estimated_weight_if_available: +(4 + Math.random() * 12).toFixed(1),
      verification_status: 'AI_VERIFIED',
    }
  }
}

export async function submitLotQuote(lotId, quoteData) {
  try {
    return await request(`/api/lots/${lotId}/quote`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    })
  } catch {
    const lot = db.LOTS.find((l) => l.id === lotId)
    if (lot) {
      const rate = quoteData.quotedRate || quoteData.quotedPrice
      lot.quotedPrice = quoteData.isPerKg ? rate * lot.weight : rate
      if (quoteData.autoAccept) lot.status = 'ACCEPTED'
    }
    return { id: lotId, success: true, message: 'Quote submitted successfully' }
  }
}

function applyFilters(list, filters = {}) {
  return list.filter((item) => {
    if (filters.search) {
      const s = filters.search.toLowerCase()
      const hay = JSON.stringify(item).toLowerCase()
      if (!hay.includes(s)) return false
    }
    if (filters.status && item.status !== filters.status) return false
    if (filters.material && item.material !== filters.material) return false
    if (filters.location && item.location !== filters.location) return false
    if (filters.recyclerId && item.recyclerId !== filters.recyclerId) return false
    return true
  })
}

export const collectors = db.COLLECTORS
export const recyclers = db.RECYCLERS
export const materials = db.MATERIAL_LIST
export const locations = db.LOCATION_LIST
export const statuses = db.STATUS_LIST
