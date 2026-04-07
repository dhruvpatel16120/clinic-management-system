import { useState, useEffect } from 'react'
import { onSnapshot, where } from 'firebase/firestore'
import { Hash, Clock, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { buildClinicScopedQuery } from '../utils/tenantScope'

export default function TokenDisplay() {
  const { clinic, clinicId } = useAuth()
  const [currentToken, setCurrentToken] = useState(null)
  const [nextToken, setNextToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (!selectedDate || !clinicId) return

    setLoading(true)

    const scopedQuery = buildClinicScopedQuery(
      'appointments',
      clinicId,
      where('appointmentDate', '==', selectedDate),
      where('status', 'in', ['token_generated', 'in_progress'])
    )

    const unsubscribe = onSnapshot(scopedQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data()
      }))

      const sortedAppointments = appointmentsData.sort((left, right) => {
        if (left.tokenNumber && right.tokenNumber) {
          return left.tokenNumber - right.tokenNumber
        }

        if (left.tokenNumber) return -1
        if (right.tokenNumber) return 1
        return 0
      })

      setCurrentToken(sortedAppointments.find((appointment) => appointment.status === 'in_progress') || null)
      setNextToken(sortedAppointments.find((appointment) => appointment.status === 'token_generated') || null)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching appointments:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedDate, clinicId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-slate-400">Loading queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Hash className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Patient Queue</h1>
              <p className="text-slate-400">{clinic?.name || 'Clinic workspace'}</p>
            </div>
          </div>
          <p className="text-slate-400">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-3 text-sm text-slate-100">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          Queue visibility is limited to signed-in clinic staff until a sanitized public kiosk feed is added.
        </div>

        {currentToken && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-3xl p-8 backdrop-blur-xl mb-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-400 mb-2">Currently Serving</h2>
              <div className="w-32 h-32 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl font-bold text-green-400">{currentToken.tokenNumber}</span>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-2">{currentToken.patientName}</h3>
                <p className="text-slate-400 mt-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {currentToken.appointmentTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {nextToken && (
          <div className="bg-gradient-to-r from-blue-500/20 to-sky-500/20 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-xl mb-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-2">Next Patient</h2>
              <div className="w-24 h-24 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-blue-400">{nextToken.tokenNumber}</span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{nextToken.patientName}</h3>
                <p className="text-slate-400 mt-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {nextToken.appointmentTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {!currentToken && !nextToken && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-xl text-center">
            <div className="w-24 h-24 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">No Active Tokens</h2>
            <p className="text-slate-400 text-lg">No patients are currently waiting or being served.</p>
          </div>
        )}
      </main>
    </div>
  )
}
