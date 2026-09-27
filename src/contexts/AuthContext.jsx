import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'ecircle_session'
const SESSION_MS = 1000 * 60 * 60 * 24 // 24h expiry

function sanitizeSession(res) {
  if (!res) return null
  const profile = res.profile || { id: res.username || 'EC-REC-00001', name: res.username || 'ASCENT URBAN RECYCLERS PVT LTD' }
  if (!profile.id) profile.id = profile.username || res.username || 'EC-REC-00001'
  if (!profile.name) profile.name = profile.companyName || profile.id
  if (!profile.materialsAccepted) profile.materialsAccepted = ['PCB', 'Cables', 'Copper', 'Aluminium']
  if (!profile.authStatus) profile.authStatus = 'AUTHORIZED'
  if (!profile.location) profile.location = 'Kanchipuram, Tamil Nadu'
  if (profile.offeredRate === undefined) profile.offeredRate = 150
  if (profile.pickupAvailable === undefined) profile.pickupAvailable = true
  if (!profile.serviceArea) profile.serviceArea = 'Kanchipuram & surrounding regions'
  if (!profile.accountStatus) profile.accountStatus = 'ACTIVE'

  return {
    ...res,
    profile
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [expiredNotice, setExpiredNotice] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.expiresAt > Date.now()) {
          setSession(sanitizeSession(parsed))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch { /* ignore */ }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!session) return
    const remaining = session.expiresAt - Date.now()
    const t = setTimeout(() => {
      setSession(null)
      localStorage.removeItem(STORAGE_KEY)
      setExpiredNotice(true)
    }, Math.max(remaining, 0))
    return () => clearTimeout(t)
  }, [session])

  const login = useCallback(async (username, password, remember) => {
    const res = await api.login(username, password)
    const sanitized = sanitizeSession(res)
    const record = { ...sanitized, expiresAt: Date.now() + SESSION_MS }
    setSession(record)
    if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return record
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const dismissExpiredNotice = useCallback(() => setExpiredNotice(false), [])

  return (
    <AuthContext.Provider value={{ session, ready, login, logout, expiredNotice, dismissExpiredNotice }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
