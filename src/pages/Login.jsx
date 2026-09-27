import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Sparkles, KeyRound, UserCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

export default function Login() {
  const { login, expiredNotice, dismissExpiredNotice } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin@2026#Secure')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username.trim(), password, remember)
      const dest = location.state?.from?.pathname || (res.role === 'ADMIN' ? '/admin' : '/recycler')
      nav(dest, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  function autofill(u, p) {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      {/* Dynamic Animated Eco Tech Background */}
      <DynamicEcoBackdrop />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-3 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25"
          >
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-emerald-950/90 backdrop-blur-xs">
              <svg width="34" height="34" viewBox="0 0 26 26" className="animate-float">
                <path d="M13 2 C7 2 3 7 3 13 C3 19 7 24 13 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M13 2 C19 2 23 7 23 13 C23 19 19 24 13 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="13" cy="13" r="3" fill="#34D399" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-emerald-400/20 blur-md -z-10 animate-pulse" />
          </motion.div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-2">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Formal E-Waste Digital Platform</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            E-CIRCLE
          </h1>
          <p className="mt-1 text-sm text-emerald-200/70 font-medium">
            Authorized Recycler & Admin Security Portal
          </p>
        </div>

        {expiredNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/60 p-3 text-xs text-amber-200 backdrop-blur-md"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Your session expired. Please sign in again.</span>
            <button type="button" onClick={dismissExpiredNotice} className="ml-auto text-amber-400 hover:text-white">×</button>
          </motion.div>
        )}

        {/* Login Glassmorphic Container */}
        <div className="relative rounded-3xl border border-emerald-500/20 bg-slate-900/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-200/80">
                User / Facility ID
              </label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or EC-REC-00001"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-200/80">
                  Password
                </label>
                <span className="text-[10px] font-medium text-emerald-400">
                  Strong policy (Mix of letters, special, nums &gt; 6)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength feedback */}
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)} 
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 accent-emerald-500" 
                />
                <span>Remember session</span>
              </label>
              <span className="text-emerald-400/80 hover:text-emerald-300 cursor-pointer">
                Authorized access only
              </span>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Credentials Autofill */}
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Quick Login Demo
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofill('admin', 'Admin@2026#Secure')}
                className="flex flex-col items-start gap-1 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2.5 text-left hover:border-emerald-400 hover:bg-emerald-900/50 transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Admin</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-200/70 truncate w-full">
                  admin / Admin@2026#Secure
                </div>
              </button>

              <button
                type="button"
                onClick={() => autofill('EC-REC-00001', 'Recycler@2026#Secure')}
                className="flex flex-col items-start gap-1 rounded-xl border border-teal-500/30 bg-teal-950/40 p-2.5 text-left hover:border-teal-400 hover:bg-teal-900/50 transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                  <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                  <span>Recycler</span>
                </div>
                <div className="font-mono text-[10px] text-teal-200/70 truncate w-full">
                  EC-REC-00001 / Recycler@2026#Secure
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          E-CIRCLE &copy; 2026 Formalized E-Waste Supply Chain Management Platform
        </p>
      </motion.div>
    </div>
  )
}

function DynamicEcoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial glow orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/20 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/20 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-900/10 blur-[120px]" />

      {/* Futuristic green grid & nodes pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="eco-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="1.5" fill="#34D399" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#eco-grid)" />
      </svg>
    </div>
  )
}
