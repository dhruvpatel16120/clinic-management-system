import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Globe, 
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
  Eye,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone
} from 'lucide-react'

export default function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalPayments: 0,
    totalAmount: 0,
    cashPayments: 0,
    cardPayments: 0,
    onlinePayments: 0,
    todayPayments: 0,
    todayAmount: 0,
    weekPayments: 0,
    weekAmount: 0,
    monthPayments: 0,
    monthAmount: 0
  })

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsRef = collection(db, 'payments')
        const q = query(paymentsRef, orderBy('processedAt', 'desc'))
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const paymentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setPayments(paymentsData)
          setFilteredPayments(paymentsData)
          setLoading(false)
          
          // Calculate analytics
          calculateAnalytics(paymentsData)
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Error fetching payments:', error)
        setLoading(false)
      }
    }
    
    fetchPayments()
  }, [])

  // Calculate analytics
  const calculateAnalytics = (paymentsData) => {
    const totalPayments = paymentsData.length
    const totalAmount = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    // Payment method breakdown
    const cashPayments = paymentsData
      .filter(payment => payment.method === 'cash')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    const cardPayments = paymentsData
      .filter(payment => payment.method === 'card')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    const onlinePayments = paymentsData
      .filter(payment => payment.method === 'online')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    // Date-based analytics
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const todayPayments = paymentsData.filter(payment => {
      const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
      return paymentDate >= startOfDay
    })
    
    const weekPayments = paymentsData.filter(payment => {
      const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
      return paymentDate >= weekAgo
    })
    
    const monthPayments = paymentsData.filter(payment => {
      const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
      return paymentDate >= monthAgo
    })
    
    const todayAmount = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const weekAmount = weekPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const monthAmount = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    setAnalytics({
      totalPayments,
      totalAmount,
      cashPayments,
      cardPayments,
      onlinePayments,
      todayPayments: todayPayments.length,
      todayAmount,
      weekPayments: weekPayments.length,
      weekAmount,
      monthPayments: monthPayments.length,
      monthAmount
    })
  }

  // Filter and search payments
  useEffect(() => {
    let filtered = [...payments]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.patientPhone?.includes(searchQuery) ||
        payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      switch (dateFilter) {
        case 'today': {
          filtered = filtered.filter(payment => {
            const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
            return paymentDate >= startOfDay
          })
          break
        }
        case 'week': {
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(payment => {
            const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
            return paymentDate >= weekAgo
          })
          break
        }
        case 'month': {
          const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(payment => {
            const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
            return paymentDate >= monthAgo
          })
          break
        }
      }
    }

    // Sort payments
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = a.processedAt?.toDate?.() || new Date(a.processedAt)
          bValue = b.processedAt?.toDate?.() || new Date(b.processedAt)
          break
        case 'amount':
          aValue = a.amount || 0
          bValue = b.amount || 0
          break
        case 'name':
          aValue = a.patientName || ''
          bValue = b.patientName || ''
          break
        default:
          aValue = a.processedAt?.toDate?.() || new Date(a.processedAt)
          bValue = b.processedAt?.toDate?.() || new Date(b.processedAt)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredPayments(filtered)
  }, [payments, searchQuery, methodFilter, dateFilter, sortBy, sortOrder])

  // Get payment method icon and color
  const getPaymentMethodIcon = (method) => {
    switch (method) {
             case 'cash':
         return { icon: Banknote, color: 'text-green-400', bgColor: 'bg-green-500/20' }
      case 'card':
        return { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
      case 'online':
        return { icon: Globe, color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
      default:
        return { icon: DollarSign, color: 'text-slate-400', bgColor: 'bg-slate-500/20' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading payment history...</p>
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
              <Receipt className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment History</h1>
              <p className="text-sm text-slate-400">Track all payment transactions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Total Payments</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{analytics.totalPayments}</p>
            <p className="text-sm text-slate-400 mt-2">₹{analytics.totalAmount.toLocaleString()}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Today</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{analytics.todayPayments}</p>
            <p className="text-sm text-slate-400 mt-2">₹{analytics.todayAmount.toLocaleString()}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">This Week</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{analytics.weekPayments}</p>
            <p className="text-sm text-slate-400 mt-2">₹{analytics.weekAmount.toLocaleString()}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">This Month</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{analytics.monthPayments}</p>
            <p className="text-sm text-slate-400 mt-2">₹{analytics.monthAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
                             <Banknote className="w-6 h-6 text-green-400" />
               <h3 className="text-lg font-semibold">Cash Payments</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{analytics.cashPayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total cash received</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Card Payments</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">₹{analytics.cardPayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total card payments</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Online Payments</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">₹{analytics.onlinePayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total online payments</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, invoice number, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Method Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Patient Name</option>
              </select>
            </div>
          </div>

          {/* Sort Order Toggle */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Payment Count */}
        <div className="mb-4">
          <p className="text-slate-400">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>
        </div>

        {/* Payments Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No payments found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Payment ID</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Method</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Reference</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const methodInfo = getPaymentMethodIcon(payment.method)
                    const MethodIcon = methodInfo.icon

                    return (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-purple-400">#{payment.id.slice(-8)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payment.patientName}</p>
                            <p className="text-sm text-slate-400">{payment.patientPhone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-cyan-400">#{payment.invoiceNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-green-400">₹{payment.amount?.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <MethodIcon className={`w-4 h-4 ${methodInfo.color}`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodInfo.bgColor} ${methodInfo.color}`}>
                              {payment.method?.charAt(0).toUpperCase() + payment.method?.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-400">
                            {payment.reference || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">
                          {payment.processedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link
                              to={`/receptionist/billing/invoices/${payment.invoiceId}`}
                              className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded transition-colors"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => window.print()}
                              className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded transition-colors"
                              title="Print Receipt"
                            >
                              <Receipt className="w-4 h-4" />
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

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSearchQuery('')
                setMethodFilter('all')
                setDateFilter('all')
                setSortBy('date')
                setSortOrder('desc')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
            <Link
              to="/receptionist/billing"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Back to Billing Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
