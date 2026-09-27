import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import TopNav from './TopNav'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ role }) {
  const { session, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && session.role !== role) {
    return <Navigate to={session.role === 'ADMIN' ? '/admin' : '/recycler'} replace />
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <TopNav />
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
