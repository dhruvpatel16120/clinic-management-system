import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  User, 
  Phone, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Zap,
  Clock,
  CheckCircle,
  Search,
  Filter,
  X
} from 'lucide-react'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const { id } = useParams() // Get invoice ID if editing
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [showQuickServices, setShowQuickServices] = useState(false)
  
  // Predefined common services for quick selection
  const commonServices = [
    { description: 'Consultation Fee', unitPrice: 500, category: 'consultation' },
    { description: 'Follow-up Consultation', unitPrice: 300, category: 'consultation' },
    { description: 'Emergency Consultation', unitPrice: 800, category: 'consultation' },
    { description: 'Blood Test', unitPrice: 400, category: 'lab' },
    { description: 'X-Ray', unitPrice: 600, category: 'imaging' },
    { description: 'ECG', unitPrice: 350, category: 'cardiology' },
    { description: 'Ultrasound', unitPrice: 1200, category: 'imaging' },
    { description: 'Dental Cleaning', unitPrice: 800, category: 'dental' },
    { description: 'Dental Filling', unitPrice: 1500, category: 'dental' },
    { description: 'Physiotherapy Session', unitPrice: 700, category: 'therapy' },
    { description: 'Medicine Dispensing', unitPrice: 200, category: 'pharmacy' },
    { description: 'Suturing', unitPrice: 1000, category: 'procedure' },
    { description: 'Dressing Change', unitPrice: 300, category: 'procedure' },
    { description: 'Injection', unitPrice: 150, category: 'procedure' },
    { description: 'Vaccination', unitPrice: 400, category: 'vaccination' }
  ]
  
  const [invoiceData, setInvoiceData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ],
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    discount: 0,
    totalAmount: 0,
    notes: '',
    terms: 'Payment due within 7 days of invoice date.',
    status: 'pending'
  })

  // Fetch patients and services on component mount
  useEffect(() => {
    fetchPatients()
    
    // If we have an ID, we're editing an existing invoice
    if (id) {
      setIsEditing(true)
      loadInvoiceData()
    }
  }, [id, loadInvoiceData])

  // Filter patients based on search term
  useEffect(() => {
    if (patientSearchTerm) {
      const filtered = patients.filter(patient =>
        patient.name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.phone?.includes(patientSearchTerm) ||
        patient.email?.toLowerCase().includes(patientSearchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [patientSearchTerm, patients])

  const fetchPatients = async () => {
    try {
      // Fetch patients from appointments (same as prescription page)
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
            address: appointment.patientAddress || '',
            lastVisit: appointment.appointmentDate
          })
          uniquePatients.push(patientMap.get(patientKey))
        }
      })
      
      setPatients(uniquePatients)
      setFilteredPatients(uniquePatients)
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Fallback to sample data if collection doesn't exist
      const samplePatients = [
        { id: '1', name: 'John Doe', phone: '+91 98765 43210', email: 'john@example.com', address: '123 Main St, City', age: '35', gender: 'Male', lastVisit: '2024-01-15' },
        { id: '2', name: 'Jane Smith', phone: '+91 98765 43211', email: 'jane@example.com', address: '456 Oak Ave, Town', age: '28', gender: 'Female', lastVisit: '2024-01-20' },
        { id: '3', name: 'Mike Johnson', phone: '+91 98765 43212', email: 'mike@example.com', address: '789 Pine Rd, Village', age: '42', gender: 'Male', lastVisit: '2024-01-18' }
      ]
      setPatients(samplePatients)
      setFilteredPatients(samplePatients)
    }
  }

  // Load existing invoice data for editing
  const loadInvoiceData = useCallback(async () => {
    try {
      const invoiceDoc = await getDoc(doc(db, 'invoices', id))
      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data()
        
        // Set invoice data
        setInvoiceData({
          ...invoiceData,
          invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        
        // Set selected patient
        if (invoiceData.patientId) {
          setSelectedPatient({
            id: invoiceData.patientId,
            name: invoiceData.patientName,
            phone: invoiceData.patientPhone,
            email: invoiceData.patientEmail,
            address: invoiceData.patientAddress
          })
        }
      }
    } catch (error) {
      console.error('Error loading invoice data:', error)
      alert('Error loading invoice data. Please try again.')
    }
  }, [id])

  // Calculate invoice totals
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const taxAmount = (subtotal * invoiceData.taxRate) / 100
    const totalAmount = subtotal + taxAmount - invoiceData.discount

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }))
  }, [invoiceData.items, invoiceData.taxRate, invoiceData.discount])

  // Handle patient selection from modal
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setInvoiceData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name || '',
      patientPhone: patient.phone || '',
      patientEmail: patient.email || '',
      patientAddress: patient.address || ''
    }))
    setShowPatientModal(false)
    setPatientSearchTerm('')
  }

  // Quick add service from predefined list
  const quickAddService = (service) => {
    const newItem = {
      description: service.description,
      quantity: 1,
      unitPrice: service.unitPrice,
      amount: service.unitPrice
    }
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    
    setShowQuickServices(false)
  }

  // Add multiple common services at once
  const addCommonServices = (category) => {
    const categoryServices = commonServices.filter(service => service.category === category)
    const newItems = categoryServices.map(service => ({
      description: service.description,
      quantity: 1,
      unitPrice: service.unitPrice,
      amount: service.unitPrice
    }))
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }))
  }

  // Auto-fill based on appointment type (if available)
  const autoFillFromAppointment = () => {
    // This could be enhanced to pull from actual appointments
    const appointmentServices = [
      { description: 'Consultation Fee', unitPrice: 500, quantity: 1 },
      { description: 'Blood Test', unitPrice: 400, quantity: 1 },
      { description: 'Medicine Dispensing', unitPrice: 200, quantity: 1 }
    ]
    
    const newItems = appointmentServices.map(service => ({
      ...service,
      amount: service.unitPrice * service.quantity
    }))
    
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice
      newItems[index].amount = quantity * unitPrice
    }
    
    setInvoiceData(prev => ({ ...prev, items: newItems }))
  }

  // Add new item
  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ]
    }))
  }

  // Remove item
  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const newItems = invoiceData.items.filter((_, i) => i !== index)
      setInvoiceData(prev => ({ ...prev, items: newItems }))
    }
  }

  // Clear all items
  const clearAllItems = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }]
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!invoiceData.patientName || !invoiceData.patientPhone) {
      alert('Please select a patient')
      return
    }

    if (invoiceData.items.some(item => !item.description || item.amount <= 0)) {
      alert('Please fill in all item details')
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        // Update existing invoice
        const invoiceToUpdate = {
          ...invoiceData,
          updatedAt: serverTimestamp()
        }
        
        await updateDoc(doc(db, 'invoices', id), invoiceToUpdate)
        alert('Invoice updated successfully!')
      } else {
        // Create new invoice
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        const invoiceToSave = {
          ...invoiceData,
          invoiceNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        await addDoc(collection(db, 'invoices'), invoiceToSave)
        alert('Invoice created successfully!')
      }
      
      navigate('/receptionist/billing')
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert(`Error ${isEditing ? 'updating' : 'creating'} invoice. Please try again.`)
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
            <button
              onClick={() => navigate('/receptionist/billing')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
              <p className="text-sm text-slate-400">{isEditing ? 'Modify existing invoice details' : 'Generate invoice for patient services'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>Patient Information</span>
            </h2>
            
            {/* Patient Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Patient *
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Select Patient</span>
                </button>
                {selectedPatient && (
                  <button
                    type="button"
                    onClick={() => setShowPatientModal(true)}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Change Patient</span>
                  </button>
                )}
              </div>
              
              {/* Selected Patient Display */}
              {selectedPatient && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{selectedPatient.name}</h3>
                      <div className="text-sm text-slate-400 mt-1">
                        {selectedPatient.age} years, {selectedPatient.gender} • {selectedPatient.phone}
                      </div>
                      {selectedPatient.email && (
                        <div className="text-sm text-slate-400 mt-1">{selectedPatient.email}</div>
                      )}
                      {selectedPatient.address && (
                        <div className="text-sm text-slate-400 mt-1">{selectedPatient.address}</div>
                      )}
                    </div>
                    <div className="text-blue-400">
                      <User className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceData.patientName}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={invoiceData.patientPhone}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, patientPhone: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={invoiceData.patientEmail}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, patientEmail: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={invoiceData.patientAddress}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, patientAddress: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Invoice Details</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Service Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Quick Service Selection</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowQuickServices(!showQuickServices)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{showQuickServices ? 'Hide' : 'Show'} Quick Services</span>
              </button>
            </div>

            {showQuickServices && (
              <div className="space-y-4">
                {/* Category-based quick add buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => addCommonServices('consultation')}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    + Consultation Services
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommonServices('lab')}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    + Lab Services
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommonServices('imaging')}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    + Imaging Services
                  </button>
                  <button
                    type="button"
                    onClick={() => addCommonServices('dental')}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    + Dental Services
                  </button>
                </div>

                {/* Auto-fill from appointment */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={autoFillFromAppointment}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Auto-fill from Appointment</span>
                  </button>
                </div>

                {/* Individual service selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {commonServices.map((service, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => quickAddService(service)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-lg transition-colors text-left"
                    >
                      <div className="font-medium text-sm">{service.description}</div>
                      <div className="text-xs text-slate-400">₹{service.unitPrice}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span>Invoice Items</span>
              </h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearAllItems}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Service or item description"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Amount (₹)
                    </label>
                    <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-green-400 font-medium">
                      {item.amount?.toLocaleString() || '0'}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={invoiceData.items.length === 1}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={invoiceData.taxRate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceData.discount}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Additional notes for the invoice..."
                  />
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Subtotal:</span>
                  <span className="font-medium">₹{invoiceData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Tax ({invoiceData.taxRate}%):</span>
                  <span className="font-medium">₹{invoiceData.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Discount:</span>
                  <span className="font-medium text-red-400">-₹{invoiceData.discount.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-400">₹{invoiceData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/receptionist/billing')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Invoice' : 'Create Invoice'}</span>
                </>
              )}
            </button>
          </div>
        </form>
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
