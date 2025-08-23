import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  DollarSign, 
  FileText, 
  CreditCard, 
  Banknote, 
  Globe, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Download
} from 'lucide-react'

export default function BillingDashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    cashPayments: 0,
    cardPayments: 0,
    onlinePayments: 0
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        // Fetch invoices
        const invoicesRef = collection(db, 'invoices')
        const invoicesQuery = query(invoicesRef, orderBy('createdAt', 'desc'))
        
        const unsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
          const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // Calculate statistics
          const totalInvoices = invoicesData.length
          const pendingPayments = invoicesData.filter(inv => inv.status === 'pending').length
          const totalRevenue = invoicesData.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
          
          // Today's revenue
          const today = new Date().toISOString().split('T')[0]
          const todayRevenue = invoicesData
            .filter(inv => inv.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] === today)
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
          
          // Payment method breakdown
          const cashPayments = invoicesData
            .filter(inv => inv.paymentMethod === 'cash' && inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
          
          const cardPayments = invoicesData
            .filter(inv => inv.paymentMethod === 'card' && inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
          
          const onlinePayments = invoicesData
            .filter(inv => inv.paymentMethod === 'online' && inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
          
          setStats({
            totalInvoices,
            pendingPayments,
            totalRevenue,
            todayRevenue,
            cashPayments,
            cardPayments,
            onlinePayments
          })
          
          setRecentInvoices(invoicesData.slice(0, 5))
          setLoading(false)
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Error fetching billing data:', error)
        setLoading(false)
      }
    }
    
    fetchBillingData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading billing data...</p>
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
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Billing & Payment Dashboard</h1>
              <p className="text-sm text-slate-400">Manage invoices, payments, and billing</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/receptionist/billing/create"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
            <Link
              to="/receptionist/billing/reports"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Reports</span>
            </Link>
            <Link
              to="/receptionist"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Total Invoices</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalInvoices}</p>
            <p className="text-sm text-slate-400 mt-2">All time</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">Pending Payments</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingPayments}</p>
            <p className="text-sm text-slate-400 mt-2">Awaiting payment</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">All time</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Today's Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">₹{stats.todayRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Today</p>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
                             <Banknote className="w-6 h-6 text-green-400" />
               <h3 className="text-lg font-semibold">Cash Payments</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{stats.cashPayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total cash received</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Card Payments</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">₹{stats.cardPayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total card payments</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Online Payments</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">₹{stats.onlinePayments.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-2">Total online payments</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/receptionist/billing/create"
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">Create Invoice</h3>
                  <p className="text-sm text-slate-400">Generate new invoice</p>
                </div>
              </div>
            </Link>

            <Link
              to="/receptionist/billing/invoices"
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold">View Invoices</h3>
                  <p className="text-sm text-slate-400">Manage all invoices</p>
                </div>
              </div>
            </Link>

            <Link
              to="/receptionist/billing/payments"
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-semibold">Process Payments</h3>
                  <p className="text-sm text-slate-400">Handle payments</p>
                </div>
              </div>
            </Link>

            <Link
              to="/receptionist/billing/reports"
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Download Reports</h3>
                  <p className="text-sm text-slate-400">Generate reports</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link
              to="/receptionist/billing/invoices"
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              View All →
            </Link>
          </div>
          
          {recentInvoices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No invoices found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5">
                      <td className="py-3 px-4">
                        <span className="font-mono text-cyan-400">#{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{invoice.patientName}</p>
                          <p className="text-sm text-slate-400">{invoice.patientPhone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-400">₹{invoice.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-500/20 text-green-400' 
                            : invoice.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {invoice.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/receptionist/billing/invoices/${invoice.id}`}
                            className="text-blue-400 hover:text-blue-300"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/receptionist/billing/invoices/${invoice.id}/download`}
                            className="text-green-400 hover:text-green-300"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
