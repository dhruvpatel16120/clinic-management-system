import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy, where, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  ArrowLeft, 
  Search, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Globe, 
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Calendar,
  FileText,
  Download,
  Printer
} from 'lucide-react'

export default function PaymentProcessing() {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amount: 0,
    reference: '',
    notes: ''
  })
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    let unsubscribe
    
    const fetchInvoices = () => {
      try {
        const invoicesRef = collection(db, 'invoices')
        const q = query(invoicesRef, where('status', 'in', ['pending', 'overdue']), orderBy('createdAt', 'desc'))
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setInvoices(invoicesData)
          setFilteredInvoices(invoicesData)
          setLoading(false)
        }, (error) => {
          console.error('Error fetching invoices:', error)
          setLoading(false)
        })
      } catch (error) {
        console.error('Error fetching invoices:', error)
        setLoading(false)
      }
    }
    
    fetchInvoices()
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Filter invoices based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = invoices.filter(invoice =>
        invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.patientPhone?.includes(searchQuery) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredInvoices(filtered)
    } else {
      setFilteredInvoices(invoices)
    }
  }, [invoices, searchQuery])

  // Open payment modal
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice)
    setPaymentData({
      method: 'cash',
      amount: invoice.totalAmount || 0,
      reference: '',
      notes: ''
    })
    setPaymentModal(true)
  }

  // Process payment
  const processPayment = async () => {
    if (!selectedInvoice || !paymentData.amount || paymentData.amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    setProcessingPayment(true)
    try {
      // Update invoice status
      await updateDoc(doc(db, 'invoices', selectedInvoice.id), {
        status: 'paid',
        paymentMethod: paymentData.method,
        paymentDate: serverTimestamp(),
        paymentReference: paymentData.reference,
        paymentNotes: paymentData.notes,
        updatedAt: serverTimestamp()
      })

      // Create payment record
      await addDoc(collection(db, 'payments'), {
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        patientName: selectedInvoice.patientName,
        patientPhone: selectedInvoice.patientPhone,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        notes: paymentData.notes,
        processedBy: 'receptionist', // You can get actual user ID here
        processedAt: serverTimestamp(),
        status: 'completed'
      })

      alert('Payment processed successfully!')
      setPaymentModal(false)
      setSelectedInvoice(null)
      setPaymentData({
        method: 'cash',
        amount: 0,
        reference: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
      case 'overdue':
        return { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' }
      default:
        return { icon: Clock, color: 'text-slate-400', bgColor: 'bg-slate-500/20' }
    }
  }

  // Calculate days overdue
  const getDaysOverdue = (invoice) => {
    if (invoice.status === 'paid') return 0
    
    const dueDate = new Date(invoice.dueDate)
    const today = new Date()
    const diffTime = today - dueDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              to="/receptionist/billing"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment Processing</h1>
              <p className="text-sm text-slate-400">Process payments for pending invoices</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-slate-300 mb-2">Search Invoices</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name, phone, or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Invoice Count */}
        <div className="mb-4">
          <p className="text-slate-400">
            Found {filteredInvoices.length} pending invoices
          </p>
        </div>

        {/* Invoices List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInvoices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No pending invoices found</p>
              <p className="text-slate-500 text-sm">All invoices have been paid</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const statusInfo = getStatusIcon(invoice.status)
              const StatusIcon = statusInfo.icon
              const daysOverdue = getDaysOverdue(invoice)

              return (
                <div key={invoice.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-mono text-cyan-400 text-lg">#{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-slate-400">
                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{invoice.patientName}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{invoice.patientPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">
                        Created: {invoice.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Amount and Overdue Info */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      ₹{invoice.totalAmount?.toLocaleString()}
                    </div>
                    {daysOverdue > 0 && (
                      <div className="text-red-400 text-sm">
                        {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPaymentModal(invoice)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Process Payment</span>
                    </button>
                    <Link
                      to={`/receptionist/billing/invoices/${invoice.id}`}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="View Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/receptionist/billing"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Back to Billing Dashboard
          </Link>
        </div>
      </main>

      {/* Payment Modal */}
      {paymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Process Payment</h2>
            
            {/* Invoice Summary */}
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Invoice:</span>
                <span className="font-mono text-cyan-400">#{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Patient:</span>
                <span className="font-medium">{selectedInvoice.patientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Amount:</span>
                <span className="text-xl font-bold text-green-400">₹{selectedInvoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-400' },
                  { value: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-400' },
                  { value: 'online', label: 'Online', icon: Globe, color: 'text-purple-400' }
                ].map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentData(prev => ({ ...prev, method: method.value }))}
                      className={`p-3 rounded-lg border transition-colors ${
                        paymentData.method === method.value
                          ? 'border-cyan-400 bg-cyan-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${method.color} mx-auto mb-1`} />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* Reference Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Reference Number</label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Transaction ID, receipt number, etc."
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                rows="2"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Additional payment notes..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={processingPayment}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
