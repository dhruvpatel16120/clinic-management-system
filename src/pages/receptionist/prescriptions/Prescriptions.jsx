import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Search,
  Filter,
  FileText,
  Pill,
  Eye,
  Download,
  Printer,
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  FileDown,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { downloadPrescriptionPDF } from './PrescriptionPdfGenerator'

export default function ReceptionistPrescriptions() {
  const { currentUser } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('today') // today, week, month, all
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDoctor, setFilterDoctor] = useState('all')
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState([])

  // Fetch prescriptions
  useEffect(() => {
    if (!currentUser) return

    setLoading(true)
    
    const prescriptionsRef = collection(db, 'prescriptions')
    const q = query(prescriptionsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPrescriptions(prescriptionsData)
      setLoading(false)
      
      if (prescriptionsData.length > 0) {
        toast.success(`Loaded ${prescriptionsData.length} prescriptions`)
      } else {
        toast.success('No prescriptions found')
      }
    }, (error) => {
      console.error('Error fetching prescriptions:', error)
      toast.error('Error loading prescriptions')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const staffRef = collection(db, 'staffData')
        const staffQuery = query(staffRef, where('role', '==', 'doctor'))
        
        const unsubscribe = onSnapshot(staffQuery, (snapshot) => {
          const doctorsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setDoctors(doctorsData)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    let filtered = prescriptions

    // Filter by date based on view mode
    if (viewMode === 'today') {
      filtered = filtered.filter(prescription => prescription.prescriptionDate === selectedDate)
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate)
      const endOfWeek = new Date(selectedDate)
      endOfWeek.setDate(endOfWeek.getDate() + 7)
      filtered = filtered.filter(prescription => {
        const prescriptionDate = new Date(prescription.prescriptionDate)
        return prescriptionDate >= startOfWeek && prescriptionDate < endOfWeek
      })
    } else if (viewMode === 'month') {
      const startOfMonth = new Date(selectedDate)
      const endOfMonth = new Date(selectedDate)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      filtered = filtered.filter(prescription => {
        const prescriptionDate = new Date(prescription.prescriptionDate)
        return prescriptionDate >= startOfMonth && prescriptionDate < endOfMonth
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === filterStatus)
    }

    // Filter by doctor
    if (filterDoctor !== 'all') {
      filtered = filtered.filter(prescription => prescription.doctorName === filterDoctor)
    }

    setFilteredPrescriptions(filtered)
  }, [prescriptions, selectedDate, viewMode, searchTerm, filterStatus, filterDoctor])

  const handlePrintPrescription = (prescription) => {
    // Implement print functionality
    toast.success(`Printing prescription for ${prescription.patientName}`)
  }

  const handleDownloadPDF = (prescription) => {
    try {
      const success = downloadPrescriptionPDF(prescription)
      if (success) {
        toast.success(`PDF downloaded for ${prescription.patientName}`)
      } else {
        toast.error(`Failed to generate PDF for ${prescription.patientName}`)
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error(`Error generating PDF for ${prescription.patientName}`)
    }
  }

  const handleDownloadAllPDFs = () => {
    try {
      let successCount = 0
      let errorCount = 0
      
      filteredPrescriptions.forEach((prescription, index) => {
        setTimeout(() => {
          try {
            const success = downloadPrescriptionPDF(prescription)
            if (success) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
            console.error(`Error downloading PDF for ${prescription.patientName}:`, error)
          }
        }, index * 1000) // Delay each download by 1 second
      })
      
      toast.success(`Started downloading ${filteredPrescriptions.length} prescriptions`)
      
      // Show final result after all downloads
      setTimeout(() => {
        if (errorCount === 0) {
          toast.success(`Successfully downloaded ${successCount} prescriptions`)
        } else {
          toast.error(`Downloaded ${successCount} prescriptions, failed ${errorCount}`)
        }
      }, (filteredPrescriptions.length + 2) * 1000)
      
    } catch (error) {
      console.error('Bulk download error:', error)
      toast.error('Error starting bulk download')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'completed': return 'text-blue-400 bg-blue-400/10'
      case 'discontinued': return 'text-red-400 bg-red-400/10'
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Pill className="w-4 h-4" />
      case 'completed': return <FileText className="w-4 h-4" />
      case 'discontinued': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const todayPrescriptions = filteredPrescriptions.filter(prescription => prescription.prescriptionDate === selectedDate)

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
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Prescriptions Management</h1>
              <p className="text-sm text-slate-400">View and manage patient prescriptions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">

            <button
              onClick={handleDownloadAllPDFs}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Download All PDFs</span>
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients, doctors, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('today')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  viewMode === 'today' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Today</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  viewMode === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>Week</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  viewMode === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  viewMode === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>All</span>
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-black focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="discontinued">Discontinued</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-black focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.fullName}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Today's Prescriptions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-400" />
            <span>Today's Prescriptions ({todayPrescriptions.length})</span>
          </h2>
          
          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading prescriptions...</p>
            </div>
          ) : todayPrescriptions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No prescriptions for today</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{prescription.patientName}</h3>
                      <p className="text-slate-400">{prescription.patientAge || 'N/A'} years old, {prescription.patientGender || 'N/A'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                        <span className="capitalize">{prescription.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{prescription.prescriptionDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Dr. {prescription.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{prescription.patientPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{prescription.patientEmail}</span>
                    </div>
                  </div>
                  
                  {prescription.diagnosis && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Diagnosis:</h4>
                      <p className="text-sm text-slate-400">{prescription.diagnosis}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Medicines ({prescription.medicines?.length || 0}):</h4>
                    <div className="space-y-1">
                      {prescription.medicines?.slice(0, 3).map((medicine, index) => (
                        <p key={index} className="text-sm text-slate-400">
                          • {medicine.name} - {medicine.dosage}
                        </p>
                      ))}
                      {prescription.medicines?.length > 3 && (
                        <p className="text-sm text-slate-400">+{prescription.medicines.length - 3} more medicines</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/receptionist/prescriptions/view/${prescription.id}`}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => handlePrintPrescription(prescription)}
                      className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(prescription)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Prescriptions Table */}
        {filteredPrescriptions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>All Prescriptions ({filteredPrescriptions.length})</span>
            </h2>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Patient</th>
                      <th className="text-left py-3 px-4">Doctor</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Diagnosis</th>
                      <th className="text-left py-3 px-4">Medicines</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{prescription.patientName}</p>
                            <p className="text-sm text-slate-400">{prescription.patientPhone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{prescription.doctorName}</td>
                        <td className="py-3 px-4 text-slate-300">{prescription.prescriptionDate}</td>
                        <td className="py-3 px-4 text-slate-300">{prescription.diagnosis || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-300">{prescription.medicines?.length || 0} medicines</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            <span className="capitalize">{prescription.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link
                              to={`/receptionist/prescriptions/view/${prescription.id}`}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                            >
                              View
                            </Link>
                            
                            <button
                              onClick={() => handleDownloadPDF(prescription)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
