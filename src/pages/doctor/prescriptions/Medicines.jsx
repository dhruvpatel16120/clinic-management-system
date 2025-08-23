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
  Plus,
  Search,
  Filter,
  FileText,
  Pill,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Package,
  Activity
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Medicines() {
  const { currentUser } = useAuth()
  const [medicines, setMedicines] = useState([])
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    strength: '',
    form: '',
    manufacturer: '',
    description: '',
    sideEffects: '',
    contraindications: '',
    dosageInstructions: '',
    storageInstructions: '',
    price: '',
    stockQuantity: '',
    reorderLevel: '',
    isActive: true
  })

  // Fetch medicines
  useEffect(() => {
    if (!currentUser) return

    setLoading(true)
    
    const medicinesRef = collection(db, 'medicines')
    const q = query(medicinesRef, orderBy('name', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMedicines(medicinesData)
      setFilteredMedicines(medicinesData)
      setLoading(false)
      
      if (medicinesData.length > 0) {
        toast.success(`Loaded ${medicinesData.length} medicines`)
      } else {
        toast.success('No medicines found')
      }
    }, (error) => {
      console.error('Error fetching medicines:', error)
      toast.error('Error loading medicines')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    let filtered = medicines

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === filterCategory)
    }

    setFilteredMedicines(filtered)
  }, [medicines, searchTerm, filterCategory])

  const handleCreateMedicine = () => {
    setFormData({
      name: '',
      category: '',
      strength: '',
      form: '',
      manufacturer: '',
      description: '',
      sideEffects: '',
      contraindications: '',
      dosageInstructions: '',
      storageInstructions: '',
      price: '',
      stockQuantity: '',
      reorderLevel: '',
      isActive: true
    })
    setShowCreateModal(true)
  }

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine)
    setFormData({
      name: medicine.name || '',
      category: medicine.category || '',
      strength: medicine.strength || '',
      form: medicine.form || '',
      manufacturer: medicine.manufacturer || '',
      description: medicine.description || '',
      sideEffects: medicine.sideEffects || '',
      contraindications: medicine.contraindications || '',
      dosageInstructions: medicine.dosageInstructions || '',
      storageInstructions: medicine.storageInstructions || '',
      price: medicine.price || '',
      stockQuantity: medicine.stockQuantity || '',
      reorderLevel: medicine.reorderLevel || '',
      isActive: medicine.isActive !== false
    })
    setShowEditModal(true)
  }

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'medicines', medicineId))
        toast.success('Medicine deleted successfully!')
      } catch (error) {
        console.error('Error deleting medicine:', error)
        toast.error(`Error deleting medicine: ${error.message}`)
      }
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter medicine name')
      return false
    }
    if (!formData.category.trim()) {
      toast.error('Please select category')
      return false
    }
    if (!formData.strength.trim()) {
      toast.error('Please enter strength')
      return false
    }
    if (!formData.form.trim()) {
      toast.error('Please select form')
      return false
    }
    if (!formData.manufacturer.trim()) {
      toast.error('Please enter manufacturer')
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
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.uid
      }
      
      if (showEditModal) {
        // Update existing medicine
        await updateDoc(doc(db, 'medicines', selectedMedicine.id), {
          ...medicineData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Medicine updated successfully!')
        setShowEditModal(false)
      } else {
        // Create new medicine
        await addDoc(collection(db, 'medicines'), medicineData)
        toast.success('Medicine created successfully!')
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
      toast.error(`Error saving medicine: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'antibiotics': return 'text-red-400 bg-red-400/10'
      case 'painkillers': return 'text-orange-400 bg-orange-400/10'
      case 'vitamins': return 'text-yellow-400 bg-yellow-400/10'
      case 'diabetes': return 'text-blue-400 bg-blue-400/10'
      case 'cardiology': return 'text-purple-400 bg-purple-400/10'
      case 'dermatology': return 'text-green-400 bg-green-400/10'
      case 'psychiatry': return 'text-pink-400 bg-pink-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return { status: 'out_of_stock', color: 'text-red-400 bg-red-400/10', text: 'Out of Stock' }
    if (quantity <= reorderLevel) return { status: 'low_stock', color: 'text-yellow-400 bg-yellow-400/10', text: 'Low Stock' }
    return { status: 'in_stock', color: 'text-green-400 bg-green-400/10', text: 'In Stock' }
  }

  const categories = [
    'antibiotics', 'painkillers', 'vitamins', 'diabetes', 'cardiology', 
    'dermatology', 'psychiatry', 'respiratory', 'gastroenterology', 'neurology'
  ]

  const forms = [
    'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 
    'drops', 'inhaler', 'suppository', 'powder'
  ]

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
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Manage Medicines</h1>
              <p className="text-sm text-slate-400">Add, edit, and manage medicine inventory</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateMedicine}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
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
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            >
              <option className="text-black" value="all">All Categories</option>
              {categories.map(category => (
                <option className="text-black" key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-slate-400">
            {filteredMedicines.length} of {medicines.length} medicines
          </div>
        </div>

        {/* Medicines Grid */}
        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading medicines...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Pill className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No medicines found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => {
              const stockStatus = getStockStatus(medicine.stockQuantity, medicine.reorderLevel)
              return (
                <div key={medicine.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{medicine.name}</h3>
                      <p className="text-slate-400">{medicine.strength} • {medicine.form}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(medicine.category)}`}>
                        {medicine.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{medicine.manufacturer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Stock: {medicine.stockQuantity || 0}</span>
                    </div>
                    {medicine.price && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">₹</span>
                        <span className="text-slate-300">{medicine.price}</span>
                      </div>
                    )}
                  </div>
                  
                  {medicine.description && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 line-clamp-2">{medicine.description}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMedicine(medicine)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(medicine.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">
                {showEditModal ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Medicine Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="Enter medicine name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option className="text-black" value="">Select Category</option>
                    {categories.map(category => (
                      <option className="text-black" key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Strength *</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Form *</label>
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData(prev => ({ ...prev, form: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option className="text-black" value="">Select Form</option>
                    {forms.map(form => (
                      <option className="text-black" key={form} value={form}>
                        {form.charAt(0).toUpperCase() + form.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Manufacturer *</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="Enter manufacturer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  placeholder="Enter medicine description..."
                />
              </div>

              {/* Medical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Side Effects</label>
                  <textarea
                    value={formData.sideEffects}
                    onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    rows="3"
                    placeholder="Common side effects..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Contraindications</label>
                  <textarea
                    value={formData.contraindications}
                    onChange={(e) => setFormData(prev => ({ ...prev, contraindications: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    rows="3"
                    placeholder="Contraindications..."
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dosage Instructions</label>
                  <textarea
                    value={formData.dosageInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosageInstructions: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    rows="3"
                    placeholder="Dosage instructions..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Storage Instructions</label>
                  <textarea
                    value={formData.storageInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageInstructions: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    rows="3"
                    placeholder="Storage instructions..."
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-blue-400 focus:ring-blue-400"
                  />
                  <span className="text-sm font-medium text-slate-300">Active Medicine</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                  }}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
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
                  <span>{loading ? 'Saving...' : (showEditModal ? 'Update Medicine' : 'Add Medicine')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
