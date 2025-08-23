import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Calendar, 
  User, 
  CreditCard, 
  Banknote, 
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  PieChart,
  Activity
} from 'lucide-react'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [dateRange, setDateRange] = useState('month')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch invoices
      const invoicesRef = collection(db, 'invoices')
      const invoicesQuery = query(invoicesRef, orderBy('createdAt', 'desc'))
      
      const invoicesUnsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
        const invoicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setInvoices(invoicesData)
      })

      // Fetch payments
      const paymentsRef = collection(db, 'payments')
      const paymentsQuery = query(paymentsRef, orderBy('processedAt', 'desc'))
      
      const paymentsUnsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
        const paymentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPayments(paymentsData)
        setLoading(false)
      })

      return () => {
        invoicesUnsubscribe()
        paymentsUnsubscribe()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  // Filter data based on date range
  const getFilteredData = () => {
    let filteredInvoices = [...invoices]
    let filteredPayments = [...payments]

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Date filtering
    switch (dateRange) {
      case 'today':
        filteredInvoices = filteredInvoices.filter(invoice => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
          return invoiceDate >= startOfDay
        })
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
          return paymentDate >= startOfDay
        })
        break
      case 'week': {
        const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredInvoices = filteredInvoices.filter(invoice => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
          return invoiceDate >= weekAgo
        })
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
          return paymentDate >= weekAgo
        })
        break
      }
      case 'month': {
        const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredInvoices = filteredInvoices.filter(invoice => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
          return invoiceDate >= monthAgo
        })
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
          return paymentDate >= monthAgo
        })
        break
      }
      case 'quarter': {
        const quarterAgo = new Date(startOfDay.getTime() - 90 * 24 * 60 * 60 * 1000)
        filteredInvoices = filteredInvoices.filter(invoice => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
          return invoiceDate >= quarterAgo
        })
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
          return paymentDate >= quarterAgo
        })
        break
      }
      case 'year': {
        const yearAgo = new Date(startOfDay.getTime() - 365 * 24 * 60 * 60 * 1000)
        filteredInvoices = filteredInvoices.filter(invoice => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
          return invoiceDate >= yearAgo
        })
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = payment.processedAt?.toDate?.() || new Date(payment.processedAt)
          return paymentDate >= yearAgo
        })
        break
      }
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === statusFilter)
    }

    // Payment method filtering
    if (paymentMethodFilter !== 'all') {
      filteredPayments = filteredPayments.filter(payment => payment.method === paymentMethodFilter)
    }

    // Search filtering
    if (searchQuery) {
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      filteredPayments = filteredPayments.filter(payment =>
        payment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return { filteredInvoices, filteredPayments }
  }

  // Calculate statistics
  const calculateStats = () => {
    const { filteredInvoices, filteredPayments } = getFilteredData()
    
    const totalInvoices = filteredInvoices.length
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)
    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid').length
    const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === 'pending').length
    const overdueInvoices = filteredInvoices.filter(invoice => invoice.status === 'overdue').length
    
    const totalPayments = filteredPayments.length
    const totalPaymentAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    // Payment method breakdown
    const paymentMethods = filteredPayments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + (payment.amount || 0)
      return acc
    }, {})
    
    // Monthly trends
    const monthlyData = {}
    filteredInvoices.forEach(invoice => {
      const date = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (invoice.totalAmount || 0)
    })

    return {
      totalInvoices,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalPayments,
      totalPaymentAmount,
      paymentMethods,
      monthlyData,
      collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
    }
  }

  // Generate and download report
  const downloadReport = () => {
    const stats = calculateStats()
    const { filteredInvoices, filteredPayments } = getFilteredData()
    
    const reportData = {
      reportGenerated: new Date().toLocaleString(),
      dateRange: dateRange,
      filters: {
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        search: searchQuery
      },
      summary: stats,
      invoices: filteredInvoices,
      payments: filteredPayments
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export to CSV
  const exportToCSV = () => {
    const { filteredInvoices, filteredPayments } = getFilteredData()
    
    // Invoices CSV
    const invoicesCSV = [
      ['Invoice Number', 'Patient Name', 'Patient Phone', 'Total Amount', 'Status', 'Created Date', 'Due Date'],
      ...filteredInvoices.map(invoice => [
        invoice.invoiceNumber || '',
        invoice.patientName || '',
        invoice.patientPhone || '',
        invoice.totalAmount || 0,
        invoice.status || '',
        invoice.createdAt?.toDate?.()?.toLocaleDateString() || '',
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    // Payments CSV
    const paymentsCSV = [
      ['Invoice Number', 'Patient Name', 'Amount', 'Payment Method', 'Reference', 'Processed Date'],
      ...filteredPayments.map(payment => [
        payment.invoiceNumber || '',
        payment.patientName || '',
        payment.amount || 0,
        payment.method || '',
        payment.reference || '',
        payment.processedAt?.toDate?.()?.toLocaleDateString() || ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    // Download both files
    const invoicesBlob = new Blob([invoicesCSV], { type: 'text/csv' })
    const paymentsBlob = new Blob([paymentsCSV], { type: 'text/csv' })
    
    const invoicesUrl = URL.createObjectURL(invoicesBlob)
    const paymentsUrl = URL.createObjectURL(paymentsBlob)
    
    const invoicesLink = document.createElement('a')
    invoicesLink.href = invoicesUrl
    invoicesLink.download = `invoices-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(invoicesLink)
    invoicesLink.click()
    document.body.removeChild(invoicesLink)
    
    const paymentsLink = document.createElement('a')
    paymentsLink.href = paymentsUrl
    paymentsLink.download = `payments-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(paymentsLink)
    paymentsLink.click()
    document.body.removeChild(paymentsLink)
    
    URL.revokeObjectURL(invoicesUrl)
    URL.revokeObjectURL(paymentsUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  const stats = calculateStats()

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
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Billing Reports</h1>
              <p className="text-sm text-slate-400">Financial analytics and insights</p>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Patient or Invoice #"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Invoices */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Total Invoices</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalInvoices}</p>
            <p className="text-sm text-slate-400 mt-2">In selected period</p>
          </div>

          {/* Total Amount */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Total Amount</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">₹{stats.totalAmount.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Invoice value</p>
          </div>

          {/* Collection Rate */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">Collection Rate</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.collectionRate.toFixed(1)}%</p>
            <p className="text-sm text-slate-400 mt-2">Paid invoices</p>
          </div>

          {/* Total Payments */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Total Payments</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">₹{stats.totalPaymentAmount.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Received amount</p>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Invoice Status Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <span>Invoice Status Breakdown</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Paid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.paidInvoices}</span>
                  <span className="text-sm text-slate-400">({stats.totalInvoices > 0 ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.pendingInvoices}</span>
                  <span className="text-sm text-slate-400">({stats.totalInvoices > 0 ? ((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Overdue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats.overdueInvoices}</span>
                  <span className="text-sm text-slate-400">({stats.totalInvoices > 0 ? ((stats.overdueInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Payment Methods</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.paymentMethods).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {method === 'cash' && <Banknote className="w-4 h-4 text-green-400" />}
                    {method === 'card' && <CreditCard className="w-4 h-4 text-blue-400" />}
                    {method === 'online' && <Globe className="w-4 h-4 text-purple-400" />}
                    <span className="capitalize">{method}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">₹{amount.toLocaleString()}</span>
                    <span className="text-sm text-slate-400">({stats.totalPaymentAmount > 0 ? ((amount / stats.totalPaymentAmount) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {getFilteredData().filteredPayments.slice(0, 10).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.patientName}</p>
                    <p className="text-sm text-slate-400">Invoice #{payment.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-400">₹{payment.amount?.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 capitalize">{payment.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
