import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  Bell, 
  Plus, 
  Edit, 
  Calendar, 
  X, 
  Search,
  Filter,
  UserCheck,
  Phone,
  Mail,
  Clock,
  Check,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Appointments() {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)

  // Form states for create/edit
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    notes: '',
    status: 'scheduled',
    symptoms: '',
    medicalHistory: '',
    medications: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: ''
    }
  })

  // Fetch real data from Firebase
  useEffect(() => {
    // Fetch appointments
    const appointmentsRef = collection(db, 'appointments')
    const q = query(appointmentsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAppointments(appointmentsData)
    }, (error) => {
      console.error('Error fetching appointments:', error)
    })

    // Fetch doctors from staffData collection
    const doctorsRef = collection(db, 'staffData')
    const doctorsQuery = query(doctorsRef, where('role', '==', 'doctor'))
    
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDoctors(doctorsData)
    }, (error) => {
      console.error('Error fetching doctors:', error)
    })

    return () => {
      unsubscribeAppointments()
      unsubscribeDoctors()
    }
  }, [])

  const handleCreateAppointment = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      patientAge: '',
      patientGender: '',
      doctorName: '',
      appointmentDate: getMinDate(), // Set to today's date
      appointmentTime: '',
      appointmentType: 'consultation',
      notes: '',
      status: 'scheduled',
      symptoms: '',
      medicalHistory: '',
      medications: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
      }
    })
    setShowCreateModal(true)
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setFormData({
      patientName: appointment.patientName || '',
      patientPhone: appointment.patientPhone || '',
      patientEmail: appointment.patientEmail || '',
      patientAge: appointment.patientAge || '',
      patientGender: appointment.patientGender || '',
      doctorName: appointment.doctorName || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      appointmentType: appointment.appointmentType || 'consultation',
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled',
      symptoms: appointment.symptoms || '',
      medicalHistory: appointment.medicalHistory || '',
      medications: appointment.medications || '',
      vitalSigns: appointment.vitalSigns || {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
      }
    })
    setShowEditModal(true)
  }

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      toast.error('Please enter patient name')
      return false
    }
    if (!formData.patientPhone.trim()) {
      toast.error('Please enter patient phone')
      return false
    }
    if (!formData.patientEmail.trim()) {
      toast.error('Please enter patient email')
      return false
    }
    if (!formData.doctorName.trim()) {
      toast.error('Please select a doctor')
      return false
    }
    if (!formData.appointmentDate) {
      toast.error('Please select appointment date')
      return false
    }
    if (!formData.appointmentTime) {
      toast.error('Please select appointment time')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      if (showEditModal) {
        // Update existing appointment in Firestore
        const appointmentRef = doc(db, 'appointments', selectedAppointment.id)
        await updateDoc(appointmentRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Appointment updated successfully!')
        setShowEditModal(false)
      } else {
        // Create new appointment in Firestore
        const appointmentData = {
          ...formData,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.uid || 'receptionist',
          status: 'scheduled' // Ensure status is set to scheduled
        }
        
        await addDoc(collection(db, 'appointments'), appointmentData)
        toast.success('Appointment created successfully!')
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error(`Error saving appointment: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      toast.success('Appointment cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error(`Error cancelling appointment: ${error.message}`)
    }
  }



  const handleRescheduleAppointment = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId)
    handleEditAppointment(appointment)
    toast.success('Appointment opened for rescheduling!')
  }



  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/10'
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      case 'rescheduled': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

       // Generate time slots from 11:00 AM to 6:00 PM
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 11; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const displayTime = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`
      slots.push({ value: time, label: displayTime })
    }
    return slots
  }

  // Get minimum and maximum dates (current date to 7 days from now)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 7)
    return maxDate.toISOString().split('T')[0]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'completed': return <Check className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      case 'rescheduled': return <Calendar className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
             {/* Header */}
       <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center space-x-3">
             <Link 
               to="/receptionist"
               className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               <span className="text-sm font-medium">Back to Dashboard</span>
             </Link>
             <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
               <Bell className="w-6 h-6 text-cyan-400" />
             </div>
             <div>
               <h1 className="text-xl font-bold">Appointment Management</h1>
               <p className="text-sm text-slate-400">Welcome, {currentUser?.displayName || 'Receptionist'}</p>
             </div>
           </div>
           <LogoutButton />
         </div>
       </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-black  focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <button
            onClick={handleCreateAppointment}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
                         <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>

        {/* Appointments List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-6">Appointments ({filteredAppointments.length})</h2>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
                             <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                 <div className="flex items-center space-x-2">
                           <UserCheck className="w-4 h-4 text-slate-400" />
                           <span className="text-slate-300">{appointment.doctorName}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           <span className="text-slate-300">
                             {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                           </span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Phone className="w-4 h-4 text-slate-400" />
                           <span className="text-slate-300">{appointment.patientPhone}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Mail className="w-4 h-4 text-slate-400" />
                           <span className="text-slate-300">{appointment.patientEmail}</span>
                         </div>
                      </div>
                      
                      {appointment.notes && (
                        <p className="text-sm text-slate-400 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                                             <button
                         onClick={() => handleEditAppointment(appointment)}
                         className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                       >
                         <Edit className="w-3 h-3" />
                       </button>
                       <button
                         onClick={() => handleRescheduleAppointment(appointment.id)}
                         className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                       >
                         <Calendar className="w-3 h-3" />
                       </button>
                       {appointment.status === 'scheduled' && (
                         <button
                           onClick={() => handleCancelAppointment(appointment.id)}
                           className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {showCreateModal ? 'Create New Appointment' : 'Edit Appointment'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Patient Phone</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Patient Email</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Patient Age</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.patientAge}
                    onChange={(e) => setFormData({...formData, patientAge: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Patient Gender</label>
                  <select
                    value={formData.patientGender}
                    onChange={(e) => setFormData({...formData, patientGender: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none [&>option]:text-black [&>option]:bg-white"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Doctor Name</label>
                  <select
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none [&>option]:text-black [&>option]:bg-white"
                    required
                  >
                    <option value="">
                      {doctors.length === 0 ? 'No doctors available' : 'Select a doctor'}
                    </option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.fullName || doctor.displayName || doctor.name}>
                        Dr. {doctor.fullName || doctor.name}
                        {doctor.specialization && ` (${doctor.specialization})`}
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && (
                    <p className="text-xs text-red-400 mt-1">
                      No doctors found. Please add doctors to the staffData collection with role: 'doctor'
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Appointment Date</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Available: {getMinDate()} to {getMaxDate()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Appointment Time</label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none [&>option]:text-black [&>option]:bg-white"
                    required
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Appointment Type</label>
                   <select
                     value={formData.appointmentType}
                     onChange={(e) => setFormData({...formData, appointmentType: e.target.value})}
                     className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none [&>option]:text-black [&>option]:bg-white"
                   >
                     <option value="consultation">Consultation</option>
                     <option value="checkup">Checkup</option>
                     <option value="emergency">Emergency</option>
                     <option value="followup">Follow-up</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                   <select
                     value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                     className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none [&>option]:text-black [&>option]:bg-white"
                   >
                     <option value="scheduled">Scheduled</option>
                     <option value="completed">Completed</option>
                     <option value="cancelled">Cancelled</option>
                     <option value="rescheduled">Rescheduled</option>
                   </select>
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Additional notes..."
                />
              </div>
              
              {/* Medical Information Section */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Medical Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Symptoms</label>
                    <textarea
                      value={formData.symptoms}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                      rows="2"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      placeholder="Current symptoms..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Medical History</label>
                    <textarea
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                      rows="2"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      placeholder="Past medical conditions..."
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Current Medications</label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Current medications and dosages..."
                  />
                </div>
                
                {/* Vital Signs */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Vital Signs</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        value={formData.vitalSigns.bloodPressure}
                        onChange={(e) => setFormData({
                          ...formData, 
                          vitalSigns: {...formData.vitalSigns, bloodPressure: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
                        placeholder="e.g., 120/80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Heart Rate</label>
                      <input
                        type="text"
                        value={formData.vitalSigns.heartRate}
                        onChange={(e) => setFormData({
                          ...formData, 
                          vitalSigns: {...formData.vitalSigns, heartRate: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
                        placeholder="e.g., 72 bpm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Temperature</label>
                      <input
                        type="text"
                        value={formData.vitalSigns.temperature}
                        onChange={(e) => setFormData({
                          ...formData, 
                          vitalSigns: {...formData.vitalSigns, temperature: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
                        placeholder="e.g., 98.6°F"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Weight</label>
                      <input
                        type="text"
                        value={formData.vitalSigns.weight}
                        onChange={(e) => setFormData({
                          ...formData, 
                          vitalSigns: {...formData.vitalSigns, weight: e.target.value}
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm"
                        placeholder="e.g., 180 lbs"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                  }}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (showCreateModal ? 'Create Appointment' : 'Update Appointment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
