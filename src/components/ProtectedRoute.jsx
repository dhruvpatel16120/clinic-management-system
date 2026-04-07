import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userRole, clinicId, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!clinicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 text-white">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center">
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-8 text-left backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-200/80">Workspace Migration</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              This account is missing a clinic workspace
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Production access is blocked until this user is attached to a clinic workspace and all
              clinic records are migrated with a matching <code>clinicId</code>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to login with error message or to appropriate dashboard
    if (userRole === 'doctor') {
      return <Navigate to="/doctor" replace />
    } else if (userRole === 'receptionist') {
      return <Navigate to="/receptionist" replace />
    } else {
      return <Navigate to="/login" replace />
    }
  }

  return children
}
