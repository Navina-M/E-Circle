import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, Menu, X, LogOut, User, Shield, Sparkles, Leaf } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/recyclers', label: 'Recyclers' },
  { to: '/admin/collectors', label: 'Collectors' },
  { to: '/admin/lots', label: 'Lots' },
  { to: '/admin/transactions', label: 'Transactions' },
  { to: '/admin/traceability', label: 'Traceability' },
  { to: '/admin/prices', label: 'Prices' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/activity', label: 'Activity' },
  { to: '/admin/settings', label: 'Settings' },
]

const RECYCLER_LINKS = [
  { to: '/recycler', label: 'Dashboard', end: true },
  { to: '/recycler/received-lots', label: 'Received Lots' },
  { to: '/recycler/active-lots', label: 'Active Lots' },
  { to: '/recycler/pickups', label: 'Pickups' },
  { to: '/recycler/transactions', label: 'Transactions' },
  { to: '/recycler/traceability', label: 'Traceability' },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
        <svg width="24" height="24" viewBox="0 0 26 26" className="shrink-0">
          <path d="M13 2 C7 2 3 7 3 13 C3 19 7 24 13 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M13 2 C19 2 23 7 23 13 C23 19 19 24 13 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="13" cy="13" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
            E-CIRCLE
          </span>
          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 tracking-wide">
            v2.6
          </span>
        </div>
        <div className="text-[10px] font-medium text-[var(--color-leaf)] tracking-wider uppercase -mt-0.5">
          E-Waste Circularity
        </div>
      </div>
    </div>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    api.getNotifications()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = items.filter((i) => !i.read).length

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen((o) => !o)} 
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-white/80 text-[var(--color-charcoal)] hover:bg-[var(--color-leaf-pale)] hover:text-[var(--color-leaf)] transition-colors shadow-sm"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white"
          >
            {unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-[var(--color-hairline)] bg-white p-3 shadow-xl"
          >
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[var(--color-hairline)] pb-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-charcoal)]/70">Notifications</span>
              {unread > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">{unread} new</span>}
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {items.map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-[var(--color-leaf-pale)] transition-colors">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-emerald-500 animate-pulse'}`} />
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-ink)]">{n.title}</div>
                    <div className="text-[11px] text-[var(--color-charcoal)]/70 mt-0.5">{n.detail}</div>
                    <div className="text-[10px] font-medium text-[var(--color-leaf)] mt-1">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileMenu() {
  const { session, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const role = session?.role || 'RECYCLER'
  const label = role === 'ADMIN' ? 'Admin' : (session?.profile?.id || session?.username || 'Recycler')
  const profilePath = role === 'ADMIN' ? '/admin/profile' : '/recycler/profile'

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen((o) => !o)} 
        className="focus-ring flex items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-white/90 py-1.5 pl-2 pr-3 hover:bg-[var(--color-leaf-pale)] hover:border-[var(--color-leaf-light)] transition-all shadow-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs">
          {role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
        </span>
        <div className="text-left">
          <div className="text-xs font-bold text-[var(--color-ink)] leading-none">{label}</div>
          <div className="text-[10px] font-semibold text-[var(--color-leaf)]">{role}</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--color-charcoal)]/50 ml-0.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -6, scale: 0.96 }} 
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-52 rounded-2xl border border-[var(--color-hairline)] bg-white p-1.5 shadow-xl"
          >
            <div className="px-3 py-2 border-b border-[var(--color-hairline)] mb-1">
              <div className="text-xs font-bold text-[var(--color-ink)]">{session?.profile?.name || label}</div>
              <div className="text-[10px] text-[var(--color-charcoal)]/60 truncate">{session?.profile?.email || `${session?.username}@ecircle.org`}</div>
            </div>
            <button 
              onClick={() => { setOpen(false); nav(profilePath) }} 
              className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[var(--color-charcoal)] hover:bg-[var(--color-leaf-pale)] hover:text-[var(--color-leaf)] transition-colors"
            >
              <User className="h-4 w-4 text-[var(--color-leaf)]" /> Profile & Security
            </button>
            <button 
              onClick={() => { logout(); nav('/login') }} 
              className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-rose-500" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TopNav() {
  const { session } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = session?.role || 'RECYCLER'
  const links = role === 'ADMIN' ? ADMIN_LINKS : RECYCLER_LINKS

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-hairline)]/80 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
        <Logo />

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:gap-1.5 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `relative rounded-xl px-3 py-2 text-xs font-bold tracking-tight transition-all duration-200 ${
                  isActive 
                    ? 'text-emerald-900 bg-emerald-100/70 shadow-xs' 
                    : 'text-[var(--color-charcoal)]/80 hover:text-[var(--color-ink)] hover:bg-[var(--color-leaf-pale)]/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span 
                      layoutId="nav-active" 
                      className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-emerald-600" 
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <NotificationBell />
          <div className="hidden sm:block"><ProfileMenu /></div>
          <button 
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-white p-1 hover:bg-[var(--color-leaf-pale)] lg:hidden transition-colors" 
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5 text-[var(--color-ink)]" /> : <Menu className="h-5 w-5 text-[var(--color-ink)]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--color-hairline)] bg-white/95 backdrop-blur-lg lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <NavLink
                  key={l.to} 
                  to={l.to} 
                  end={l.end} 
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-emerald-100 text-emerald-900' : 'text-[var(--color-charcoal)] hover:bg-[var(--color-leaf-pale)]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-[var(--color-hairline)] pt-3 sm:hidden">
                <ProfileMenu />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
