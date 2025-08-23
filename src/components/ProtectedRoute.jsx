import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userRole, loading } = useAuth()

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
