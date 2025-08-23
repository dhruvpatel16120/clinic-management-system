import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
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
import { collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function CreatePrescription() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [medicines, setMedicines] = useState([])
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientEmail: patient.email
    }))
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await addDoc(collection(db, 'prescriptions'), prescriptionData)
      toast.success('Prescription created successfully!')
      navigate('/doctor/prescriptions')
    } catch (error) {
      console.error('Error creating prescription:', error)
      toast.error(`Error creating prescription: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getTimingLabel = (timing) => {
    switch (timing) {
      case 'before_meal': return 'Before Meal'
      case 'after_meal': return 'After Meal'
      case 'empty_stomach': return 'Empty Stomach'
      case 'bedtime': return 'Bedtime'
      case 'as_needed': return 'As Needed'
      default: return timing
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
              <h1 className="text-xl font-bold">Create Prescription</h1>
              <p className="text-sm text-slate-400">Write a new prescription for patient</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowMedicineDropdown(!showMedicineDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                
                {showMedicineDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0"
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-slate-400">
                          {patient.age} years, {patient.gender} • {patient.phone}
                        </div>
                        <div className="text-xs text-slate-500">Last visit: {patient.lastVisit}</div>
                      </button>
                    ))}
                  </div>
                )}
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
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
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
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                
                <div className="mt-2 max-h-60 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg">
                  {filteredMedicines.map((medicine) => (
                    <button
                      key={medicine.id}
                      type="button"
                      onClick={() => handleAddMedicine(medicine)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0"
                    >
                      <div className="font-medium">{medicine.name}</div>
                      <div className="text-sm text-slate-400">
                        {medicine.category} • {medicine.strength} • {medicine.form}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Added Medicines */}
            <div className="space-y-4">
              {formData.medicines.map((medicine, index) => (
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
                        <option value="after_meal">After Meal</option>
                        <option value="before_meal">Before Meal</option>
                        <option value="empty_stomach">Empty Stomach</option>
                        <option value="bedtime">Bedtime</option>
                        <option value="as_needed">As Needed</option>
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
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="pending">Pending</option>
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
              <span>{loading ? 'Creating...' : 'Create Prescription'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
