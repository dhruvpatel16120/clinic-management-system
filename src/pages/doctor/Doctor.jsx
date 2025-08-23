import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import LogoutButton from '../../components/LogoutButton'
import EmailVerificationStatus from '../../components/EmailVerificationStatus'
import { FaUserDoctor, FaCalendar, FaUserInjured, FaPills, FaCalendarDay, FaFileLines, FaPlus, FaHashtag } from 'react-icons/fa6'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Doctor() {
  const { currentUser, userRole } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    weeklyPrescriptions: 0,
    loading: true
  })
  const [doctorName, setDoctorName] = useState('')

  // Fetch doctor's name from staffData collection
  useEffect(() => {
    if (!currentUser) return

    const fetchDoctorName = async () => {
      try {
        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const name = userData.fullName || currentUser.displayName || 'Unknown Doctor'
          setDoctorName(name)
        } else {
          setDoctorName(currentUser.displayName || 'Unknown Doctor')
        }
      } catch (error) {
        console.error('Error fetching doctor name:', error)
        setDoctorName(currentUser.displayName || 'Unknown Doctor')
      }
    }

    fetchDoctorName()
  }, [currentUser])

  // Fetch real-time stats
  useEffect(() => {
    if (!doctorName) return

    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    // Query for today's appointments
    const todayAppointmentsRef = collection(db, 'appointments')
    const todayQuery = query(
      todayAppointmentsRef,
      where('appointmentDate', '==', today),
      where('doctorName', '==', doctorName)
    )

    // Query for waiting patients (tokens generated but not completed)
    const waitingPatientsRef = collection(db, 'appointments')
    const waitingQuery = query(
      waitingPatientsRef,
      where('appointmentDate', '==', today),
      where('doctorName', '==', doctorName)
    )

    // Query for weekly prescriptions
    const weeklyPrescriptionsRef = collection(db, 'prescriptions')
    const weeklyQuery = query(
      weeklyPrescriptionsRef,
      where('doctorId', '==', currentUser.uid)
    )

    // Set up real-time listeners
    const unsubscribeToday = onSnapshot(todayQuery, (snapshot) => {
      const todayCount = snapshot.docs.length
      setStats(prev => ({ ...prev, todayAppointments: todayCount }))
    })

    const unsubscribeWaiting = onSnapshot(waitingQuery, (snapshot) => {
      const waitingCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.status === 'token_generated' || data.status === 'in_progress'
      }).length
      setStats(prev => ({ ...prev, waitingPatients: waitingCount }))
    })

    const unsubscribeWeekly = onSnapshot(weeklyQuery, (snapshot) => {
      const weeklyCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        const createdAt = new Date(data.createdAt)
        return createdAt >= weekStart
      }).length
      setStats(prev => ({ ...prev, weeklyPrescriptions: weeklyCount, loading: false }))
    })

    return () => {
      unsubscribeToday()
      unsubscribeWaiting()
      unsubscribeWeekly()
    }
  }, [doctorName, currentUser])

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
          <Link to="/doctor/appointments" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaCalendar className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold">Today's Appointments</h3>
              </div>
              <FaCalendarDay className="w-4 h-4 text-blue-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <p className="text-lg text-slate-400">Loading...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-blue-400">{stats.todayAppointments}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {stats.todayAppointments === 0 ? 'No appointments today' : 
                   stats.todayAppointments === 1 ? 'appointment scheduled' : 
                   'appointments scheduled'}
                </p>
              </>
            )}
            <p className="text-xs text-blue-400 mt-2">Click to view all appointments →</p>
          </Link>

          <Link to="/doctor/tokens" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Patient Queue</h3>
              </div>
              <FaHashtag className="w-4 h-4 text-yellow-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                <p className="text-lg text-slate-400">Loading...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-yellow-400">{stats.waitingPatients}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {stats.waitingPatients === 0 ? 'No patients waiting' :
                   stats.waitingPatients === 1 ? 'patient waiting' :
                   'patients waiting'}
                </p>
              </>
            )}
            <p className="text-xs text-yellow-400 mt-2">Click to view queue →</p>
          </Link>

          <Link to="/doctor/prescriptions" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaPills className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">Prescriptions</h3>
              </div>
              <FaFileLines className="w-4 h-4 text-purple-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                <p className="text-lg text-slate-400">Loading...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-purple-400">{stats.weeklyPrescriptions}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {stats.weeklyPrescriptions === 0 ? 'No prescriptions this week' :
                   'prescriptions this week'}
                </p>
              </>
            )}
            <p className="text-xs text-purple-400 mt-2">Click to manage prescriptions →</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/doctor/appointments" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FaCalendar className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold">View Appointments</h3>
                  <p className="text-sm text-slate-400">Manage patient appointments</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/create" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPlus className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">New Prescription</h3>
                  <p className="text-sm text-slate-400">Create prescription for patient</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FaFileLines className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-semibold">View Prescriptions</h3>
                  <p className="text-sm text-slate-400">Manage all prescriptions</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/medicines" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPills className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Manage Medicines</h3>
                  <p className="text-sm text-slate-400">Add/edit medicine inventory</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/tokens" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold">Patient Queue</h3>
                  <p className="text-sm text-slate-400">View and manage patient tokens</p>
                </div>
              </div>
            </Link>
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
              <EmailVerificationStatus />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


