import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Plus,
  Minus,
  Save,
  ArrowLeft,
  Pill,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function CreatePrescription() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const medicineDropdownRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [patients, setPatients] = useState([])
  const [medicines, setMedicines] = useState([])
  const [filteredMedicines, setFilteredMedicines] = useState([])
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [filteredPatients, setFilteredPatients] = useState([])

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    patientEmail: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    medicines: [],
    instructions: '',
    followUpDate: '',
    status: 'active',
    notes: ''
  })

  // Fetch prescription data for editing
  const fetchPrescriptionData = useCallback(async () => {
    if (!id) return
    
    setInitialLoading(true)
    try {
      // First try to fetch as prescription
      const prescriptionRef = doc(db, 'prescriptions', id)
      const prescriptionSnap = await getDoc(prescriptionRef)
      
      if (prescriptionSnap.exists()) {
        const prescriptionData = prescriptionSnap.data()
        
        // This is edit mode - editing an existing prescription
        setIsEditMode(true)
        
        // Set form data
        setFormData({
          patientId: prescriptionData.patientId || '',
          patientName: prescriptionData.patientName || '',
          patientAge: prescriptionData.patientAge || '',
          patientGender: prescriptionData.patientGender || '',
          patientPhone: prescriptionData.patientPhone || '',
          patientEmail: prescriptionData.patientEmail || '',
          prescriptionDate: prescriptionData.prescriptionDate || new Date().toISOString().split('T')[0],
          diagnosis: prescriptionData.diagnosis || '',
          symptoms: prescriptionData.symptoms || '',
          medicines: prescriptionData.medicines || [],
          instructions: prescriptionData.instructions || '',
          followUpDate: prescriptionData.followUpDate || '',
          status: prescriptionData.status || 'active',
          notes: prescriptionData.notes || ''
        })

        toast.success('Prescription data loaded successfully')
      } else {
        // If not a prescription, try to fetch as appointment
        const appointmentRef = doc(db, 'appointments', id)
        const appointmentSnap = await getDoc(appointmentRef)
        
        if (appointmentSnap.exists()) {
          const appointmentData = appointmentSnap.data()
          
          // This is create mode - creating a new prescription from appointment
          setIsEditMode(false)
          
          // Pre-fill form with appointment data
          setFormData(prev => ({
            ...prev,
            patientId: appointmentData.id,
            patientName: appointmentData.patientName || '',
            patientAge: appointmentData.patientAge || '',
            patientGender: appointmentData.patientGender || '',
            patientPhone: appointmentData.patientPhone || '',
            patientEmail: appointmentData.patientEmail || '',
            symptoms: appointmentData.symptoms || '',
            notes: appointmentData.notes || ''
          }))

          toast.success(`Patient data loaded from appointment: ${appointmentData.patientName}`)
        } else {
          toast.error('Prescription or appointment not found')
          navigate('/doctor/prescriptions')
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
      navigate('/doctor/prescriptions')
    } finally {
      setInitialLoading(false)
    }
  }, [id, navigate])

  // Check if we're in edit mode and fetch data
  useEffect(() => {
    if (id) {
      // Check if this is a prescription ID (edit mode) or appointment ID (new prescription)
      fetchPrescriptionData()
    }
  }, [id, fetchPrescriptionData])

  // Fetch patients and medicines
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients from appointments
        const appointmentsRef = collection(db, 'appointments')
        const appointmentsQuery = query(appointmentsRef, orderBy('createdAt', 'desc'))
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        
        const uniquePatients = []
        const patientMap = new Map()
        
        appointmentsSnapshot.docs.forEach(doc => {
          const appointment = doc.data()
          const patientKey = `${appointment.patientName}-${appointment.patientPhone}`
          
          if (!patientMap.has(patientKey)) {
            patientMap.set(patientKey, {
              id: patientKey,
              name: appointment.patientName,
              age: appointment.patientAge,
              gender: appointment.patientGender,
              phone: appointment.patientPhone,
              email: appointment.patientEmail,
              lastVisit: appointment.appointmentDate
            })
            uniquePatients.push(patientMap.get(patientKey))
          }
        })
        
        setPatients(uniquePatients)
        setFilteredPatients(uniquePatients)

        // Fetch medicines
        const medicinesRef = collection(db, 'medicines')
        const medicinesQuery = query(medicinesRef, orderBy('name', 'asc'))
        
        const unsubscribe = onSnapshot(medicinesQuery, (snapshot) => {
          const medicinesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setMedicines(medicinesData)
          setFilteredMedicines(medicinesData)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error loading data')
      }
    }

    fetchData()
  }, [])

  // Filter medicines based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMedicines(filtered)
    } else {
      setFilteredMedicines(medicines)
    }
  }, [searchTerm, medicines])

  // Filter patients based on search
  useEffect(() => {
    if (patientSearchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.phone.includes(patientSearchTerm) ||
        patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [patientSearchTerm, patients])

  // Handle click outside medicine dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(event.target)) {
        setShowMedicineDropdown(false)
        setSearchTerm('')
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMedicineDropdown(false)
        setShowPatientModal(false)
        setSearchTerm('')
        setPatientSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientEmail: patient.email
    }))
    setShowPatientModal(false)
    setPatientSearchTerm('')
    toast.success(`Selected patient: ${patient.name}`)
  }

  const handleAddMedicine = (medicine) => {
    const existingMedicine = formData.medicines.find(m => m.id === medicine.id)
    
    if (existingMedicine) {
      toast.error('Medicine already added')
      return
    }

    const newMedicine = {
      id: medicine.id,
      name: medicine.name,
      category: medicine.category,
      dosage: '',
      frequency: '',
      duration: '',
      timing: 'after_meal',
      specialInstructions: ''
    }

    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }))
    
    setShowMedicineDropdown(false)
    setSearchTerm('')
    toast.success(`Added ${medicine.name}`)
  }

  const handleRemoveMedicine = (medicineId) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter(m => m.id !== medicineId)
    }))
    toast.success('Medicine removed')
  }

  const handleMedicineChange = (medicineId, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map(medicine =>
        medicine.id === medicineId
          ? { ...medicine, [field]: value }
          : medicine
      )
    }))
  }

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      toast.error('Please select a patient')
      return false
    }
    if (!formData.diagnosis.trim()) {
      toast.error('Please enter diagnosis')
      return false
    }
    if (formData.medicines.length === 0) {
      toast.error('Please add at least one medicine')
      return false
    }
    
    // Validate medicine details
    for (const medicine of formData.medicines) {
      if (!medicine.dosage.trim()) {
        toast.error(`Please enter dosage for ${medicine.name}`)
        return false
      }
      if (!medicine.frequency.trim()) {
        toast.error(`Please enter frequency for ${medicine.name}`)
        return false
      }
      if (!medicine.duration.trim()) {
        toast.error(`Please enter duration for ${medicine.name}`)
        return false
      }
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
      const prescriptionData = {
        ...formData,
        doctorName: currentUser.displayName || 'Unknown Doctor',
        doctorId: currentUser.uid,
        updatedAt: new Date().toISOString()
      }

      if (isEditMode) {
        // Update existing prescription
        const prescriptionRef = doc(db, 'prescriptions', id)
        await updateDoc(prescriptionRef, prescriptionData)
        toast.success('Prescription updated successfully!')
      } else {
        // Create new prescription
        prescriptionData.createdAt = new Date().toISOString()
        await addDoc(collection(db, 'prescriptions'), prescriptionData)
        toast.success('Prescription created successfully!')
      }
      
      navigate('/doctor/prescriptions')
    } catch (error) {
      console.error('Error saving prescription:', error)
      toast.error(`Error saving prescription: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link 
              to="/doctor/prescriptions"
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Prescriptions</span>
            </Link>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
                         <div>
               <h1 className="text-xl font-bold">{isEditMode ? 'Edit Prescription' : 'Create Prescription'}</h1>
               <p className="text-sm text-slate-400">
                 {isEditMode ? 'Update prescription details' : id ? 'Create prescription from appointment' : 'Write a new prescription for patient'}
               </p>
             </div>
          </div>
          <LogoutButton />
        </div>
      </header>

             {/* Main Content */}
       <main className="max-w-4xl mx-auto p-6">
         {initialLoading ? (
           <div className="flex items-center justify-center min-h-96">
             <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
               <p className="text-slate-400">Loading prescription data...</p>
             </div>
           </div>
         ) : (
           <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Patient Information</span>
            </h2>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Select Patient</label>
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     placeholder="Click to select a patient..."
                     value={formData.patientName}
                     readOnly
                     className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none cursor-pointer"
                     onClick={() => setShowPatientModal(true)}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPatientModal(true)}
                     className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                   >
                     <Search className="w-4 h-4" />
                     <span>Select</span>
                   </button>
                 </div>
               </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prescription Date</label>
                <input
                  type="date"
                  value={formData.prescriptionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, prescriptionDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Patient Age</label>
                <input
                  type="text"
                  value={formData.patientAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Patient Gender</label>
                                  <select
                    value={formData.patientGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientGender: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="" className="text-black">Select Gender</option>
                    <option value="Male" className="text-black">Male</option>
                    <option value="Female" className="text-black">Female</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis and Symptoms */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span>Diagnosis & Symptoms</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  placeholder="Enter diagnosis..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Symptoms</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  placeholder="Enter symptoms..."
                />
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Pill className="w-5 h-5 text-green-400" />
                <span>Medicines ({formData.medicines.length})</span>
              </h2>
              
              <button
                type="button"
                onClick={() => setShowMedicineDropdown(!showMedicineDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>
            
            {/* Medicine Search Dropdown */}
            {showMedicineDropdown && (
              <div className="mb-4" ref={medicineDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                
                <div className="mt-2 max-h-60 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        type="button"
                        onClick={() => handleAddMedicine(medicine)}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0 text-white"
                      >
                        <div className="font-medium text-white">{medicine.name}</div>
                        <div className="text-sm text-slate-400">
                          {medicine.category} • {medicine.strength} • {medicine.form}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-400 text-center">
                      {searchTerm ? 'No medicines found matching your search.' : 'No medicines available. Add medicines first.'}
                    </div>
                  )}
                </div>
              </div>
            )}
            
                         {/* Added Medicines */}
             <div className="space-y-4">
               {formData.medicines.map((medicine) => (
                <div key={medicine.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{medicine.name}</h3>
                      <p className="text-sm text-slate-400">{medicine.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(medicine.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none text-sm"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(medicine.id, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none text-sm"
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Duration</label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(medicine.id, 'duration', e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none text-sm"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Timing</label>
                      <select
                        value={medicine.timing}
                        onChange={(e) => handleMedicineChange(medicine.id, 'timing', e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white focus:border-blue-400 focus:outline-none text-sm"
                      >
                        <option value="after_meal" className="text-black">After Meal</option>
                        <option value="before_meal" className="text-black">Before Meal</option>
                        <option value="empty_stomach" className="text-black">Empty Stomach</option>
                        <option value="bedtime" className="text-black">Bedtime</option>
                        <option value="as_needed" className="text-black">As Needed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Special Instructions</label>
                    <input
                      type="text"
                      value={medicine.specialInstructions}
                      onChange={(e) => handleMedicineChange(medicine.id, 'specialInstructions', e.target.value)}
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none text-sm"
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions and Follow-up */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Instructions & Follow-up</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">General Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  placeholder="General instructions for the patient..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="active" className="text-black">Active</option>
                    <option value="completed" className="text-black">Completed</option>
                    <option value="discontinued" className="text-black">Discontinued</option>
                    <option value="pending" className="text-black">Pending</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/doctor/prescriptions"
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
                             <span>{loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Prescription' : 'Create Prescription')}</span>
            </button>
                     </div>
           </form>
         )}
       </main>

       {/* Patient Selection Modal */}
       {showPatientModal && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
             {/* Modal Header */}
             <div className="flex justify-between items-center p-6 border-b border-white/10">
               <h2 className="text-xl font-bold text-white">Select Patient</h2>
               <button
                 onClick={() => {
                   setShowPatientModal(false)
                   setPatientSearchTerm('')
                 }}
                 className="text-slate-400 hover:text-white transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>

             {/* Search Input */}
             <div className="p-6 border-b border-white/10">
               <input
                 type="text"
                 placeholder="Search patients by name, phone, or email..."
                 value={patientSearchTerm}
                 onChange={(e) => setPatientSearchTerm(e.target.value)}
                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                 autoFocus
               />
             </div>

             {/* Patient List */}
             <div className="flex-1 overflow-y-auto max-h-96">
               {filteredPatients.length > 0 ? (
                 filteredPatients.map((patient) => (
                   <button
                     key={patient.id}
                     onClick={() => handlePatientSelect(patient)}
                     className="w-full p-4 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors"
                   >
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="font-medium text-white text-lg">{patient.name}</div>
                         <div className="text-slate-400 mt-1">
                           {patient.age} years, {patient.gender} • {patient.phone}
                         </div>
                         {patient.email && (
                           <div className="text-slate-500 text-sm mt-1">{patient.email}</div>
                         )}
                         <div className="text-slate-500 text-sm mt-1">
                           Last visit: {patient.lastVisit}
                         </div>
                       </div>
                       <div className="text-blue-400">
                         <User className="w-5 h-5" />
                       </div>
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="p-8 text-center">
                   <div className="text-slate-400 text-lg mb-2">
                     {patientSearchTerm ? 'No patients found matching your search.' : 'No patients available.'}
                   </div>
                   <div className="text-slate-500 text-sm">
                     {patientSearchTerm ? 'Try a different search term.' : 'Create appointments first to see patients here.'}
                   </div>
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             <div className="p-6 border-t border-white/10 flex justify-end">
               <button
                 onClick={() => {
                   setShowPatientModal(false)
                   setPatientSearchTerm('')
                 }}
                 className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }
