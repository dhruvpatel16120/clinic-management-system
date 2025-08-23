import { useAuth } from '../hooks/useAuth'
import LogoutButton from '../components/LogoutButton'
import { FaUserDoctor, FaCalendar, FaUserInjured, FaPills } from 'react-icons/fa6'

export default function Doctor() {
  const { currentUser, userRole } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FaUserDoctor className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Doctor Dashboard</h1>
              <p className="text-sm text-slate-400">Welcome, {currentUser?.displayName || 'Doctor'}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FaCalendar className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Today's Appointments</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">12</p>
            <p className="text-sm text-slate-400 mt-2">+2 from yesterday</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FaUserInjured className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Active Patients</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">8</p>
            <p className="text-sm text-slate-400 mt-2">Currently in treatment</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FaPills className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Prescriptions</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">15</p>
            <p className="text-sm text-slate-400 mt-2">This week</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Role</p>
              <p className="text-blue-400 font-medium capitalize">{userRole}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Full Name</p>
              <p className="text-white font-medium">{currentUser?.displayName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Email Verified</p>
              <p className={`font-medium ${currentUser?.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                {currentUser?.emailVerified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


