import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  Hash, 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  ArrowLeft,
  RefreshCw,
  Printer,
  Eye,
  Search,
  Filter
} from 'lucide-react'
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function TokenManagement() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [nextTokenNumber, setNextTokenNumber] = useState(1)

  // Fetch appointments for the selected date
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate) return

      setLoading(true)
      try {
        const appointmentsRef = collection(db, 'appointments')
        const q = query(
          appointmentsRef, 
          where('appointmentDate', '==', selectedDate)
        )
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const appointmentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // Sort by token number if available, otherwise by creation time
          const sortedAppointments = appointmentsData.sort((a, b) => {
            if (a.tokenNumber && b.tokenNumber) {
              return a.tokenNumber - b.tokenNumber
            }
            if (a.tokenNumber) return -1
            if (b.tokenNumber) return 1
            // Parse dates for comparison
            const dateA = new Date(a.createdAt || 0)
            const dateB = new Date(b.createdAt || 0)
            return dateA - dateB
          })
          
          setAppointments(sortedAppointments)
          setFilteredAppointments(sortedAppointments)
          
          // Calculate next token number
          const maxToken = sortedAppointments.reduce((max, apt) => {
            return apt.tokenNumber && apt.tokenNumber > max ? apt.tokenNumber : max
          }, 0)
          setNextTokenNumber(maxToken + 1)
        }, (error) => {
          console.error('Error fetching appointments:', error)
          toast.error('Error loading appointments')
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Error loading appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [selectedDate])

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientPhone.includes(searchTerm) ||
        (appointment.tokenNumber && appointment.tokenNumber.toString().includes(searchTerm))
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterStatus)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, filterStatus])

  // Generate token for an appointment
  const generateToken = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      
      await updateDoc(appointmentRef, {
        tokenNumber: nextTokenNumber,
        tokenGeneratedAt: new Date().toISOString(),
        status: 'token_generated'
      })
      
      toast.success(`Token ${nextTokenNumber} generated successfully!`)
      setNextTokenNumber(prev => prev + 1)
    } catch (error) {
      console.error('Error generating token:', error)
      toast.error('Error generating token')
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      toast.success(`Appointment status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Error updating appointment status')
    }
  }

  // Print token
  const printToken = (appointment) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Token ${appointment.tokenNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .token { font-size: 48px; font-weight: bold; color: #2563eb; margin: 20px 0; }
            .patient-info { margin: 20px 0; }
            .appointment-info { margin: 20px 0; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Patient Token</h1>
          <div class="token">${appointment.tokenNumber}</div>
          <div class="patient-info">
            <h2>${appointment.patientName}</h2>
            <p>Age: ${appointment.patientAge} | Gender: ${appointment.patientGender}</p>
            <p>Phone: ${appointment.patientPhone}</p>
          </div>
          <div class="appointment-info">
            <p>Date: ${appointment.appointmentDate}</p>
            <p>Time: ${appointment.appointmentTime}</p>
            <p>Doctor: ${appointment.doctorName}</p>
          </div>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { color: 'text-blue-400 bg-blue-400/10', icon: ClockIcon }
      case 'token_generated':
        return { color: 'text-green-400 bg-green-400/10', icon: CheckCircle }
      case 'in_progress':
        return { color: 'text-yellow-400 bg-yellow-400/10', icon: AlertCircle }
      case 'completed':
        return { color: 'text-green-600 bg-green-600/10', icon: CheckCircle }
      case 'cancelled':
        return { color: 'text-red-400 bg-red-400/10', icon: AlertCircle }
      default:
        return { color: 'text-gray-400 bg-gray-400/10', icon: ClockIcon }
    }
  }

  // Get today's date in readable format
  const getTodayDisplay = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link 
              to="/receptionist"
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Hash className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Token Management</h1>
              <p className="text-sm text-slate-400">Manage patient tokens for today's appointments</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Date Selection and Stats */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-lg font-semibold mb-2">Today's Appointments</h2>
              <p className="text-slate-400">{getTodayDisplay()}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              />
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{appointments.length}</div>
                <div className="text-sm text-slate-400">Total Appointments</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {appointments.filter(apt => apt.tokenNumber).length}
                </div>
                <div className="text-sm text-slate-400">Tokens Generated</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {appointments.filter(apt => apt.status === 'in_progress').length}
                </div>
                <div className="text-sm text-slate-400">In Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, or token number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            >
              <option className='text-black' value="all">All Status</option>
              <option className='text-black' value="scheduled">Scheduled</option>
              <option className='text-black' value="token_generated">Token Generated</option>
              <option className='text-black' value="in_progress">In Progress</option>
              <option className='text-black' value="completed">Completed</option>
              <option className='text-black' value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading appointments...</p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-slate-400 text-lg mb-2">No appointments found</div>
              <div className="text-slate-500 text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No appointments scheduled for the selected date.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Token</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Appointment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAppointments.map((appointment) => {
                    const statusInfo = getStatusInfo(appointment.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <tr key={appointment.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          {appointment.tokenNumber ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-blue-400">{appointment.tokenNumber}</span>
                              </div>
                              <button
                                onClick={() => printToken(appointment)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Print Token"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-slate-400">-</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{appointment.patientName}</div>
                            <div className="text-sm text-slate-400">
                              {appointment.patientAge} years, {appointment.patientGender}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                            {appointment.patientEmail && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400">{appointment.patientEmail}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{appointment.appointmentDate}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-400">{appointment.appointmentTime}</span>
                            </div>
                            <div className="text-sm text-slate-400">{appointment.doctorName}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {appointment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {!appointment.tokenNumber && (
                              <button
                                onClick={() => generateToken(appointment.id)}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                                title="Generate Token"
                              >
                                Generate Token
                              </button>
                            )}
                            
                            {appointment.tokenNumber && appointment.status === 'token_generated' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors"
                                title="Mark In Progress"
                              >
                                Start Consultation
                              </button>
                            )}
                            
                            {appointment.status === 'in_progress' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            )}
                            
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                              title="Cancel Appointment"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
