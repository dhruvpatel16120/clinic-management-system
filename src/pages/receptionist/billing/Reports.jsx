import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  PieChart,
  Activity,
  FileDown,
  Loader2
} from 'lucide-react'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportType, setReportType] = useState('daily')

  useEffect(() => {
    setLoading(true)
    
    const invoicesRef = collection(db, 'invoices')
    const invoicesQuery = query(invoicesRef, orderBy('createdAt', 'desc'))
    const invoicesUnsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setInvoices(invoicesData)
    }, (error) => {
      console.error('Error fetching invoices:', error)
    })

    const paymentsRef = collection(db, 'payments')
    const paymentsQuery = query(paymentsRef, orderBy('processedAt', 'desc'))
    const paymentsUnsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPayments(paymentsData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching payments:', error)
      setLoading(false)
    })

    return () => {
      invoicesUnsubscribe()
      paymentsUnsubscribe()
    }
  }, [])

  // Helper to safely parse Firestore Timestamp, string or date value
  const getSafeDate = useCallback((val) => {
    if (!val) return new Date(0)
    if (typeof val.toDate === 'function') return val.toDate()
    return new Date(val)
  }, [])

  // Get date range based on report type and selected date
  const getDateRange = useCallback(() => {
    let startDate, endDate

    switch (reportType) {
      case 'daily': {
        const selected = new Date(selectedDate)
        startDate = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
        endDate = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999)
        break
      }
      case 'weekly': {
        const selected = new Date(selectedDate)
        const dayOfWeek = selected.getDay()
        startDate = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - dayOfWeek)
        endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999)
        break
      }
      case 'monthly': {
        const [year, month] = selectedMonth.split('-').map(Number)
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 0, 23, 59, 59, 999)
        break
      }
      case 'yearly':
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999)
        break
      default: {
        const sel = new Date(selectedDate)
        startDate = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate())
        endDate = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate(), 23, 59, 59, 999)
      }
    }

    return { startDate, endDate }
  }, [selectedDate, selectedMonth, selectedYear, reportType])

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    const { startDate, endDate } = getDateRange()

    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = getSafeDate(invoice.createdAt)
      return invoiceDate >= startDate && invoiceDate <= endDate
    })

    const filteredPayments = payments.filter(payment => {
      const paymentDate = getSafeDate(payment.processedAt)
      return paymentDate >= startDate && paymentDate <= endDate
    })

    return { filteredInvoices, filteredPayments }
  }, [invoices, payments, getDateRange, getSafeDate])

  // Calculate statistics
  const stats = useMemo(() => {
    const { filteredInvoices, filteredPayments } = filteredData
    
    const totalInvoices = filteredInvoices.length
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)
    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid')
    const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === 'pending')
    const overdueInvoices = filteredInvoices.filter(invoice => invoice.status === 'overdue')
    
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    
    const totalPayments = filteredPayments.length
    const totalPaymentAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    
    // Payment method breakdown
    const cashPayments = filteredPayments.filter(p => p.method === 'cash')
    const cardPayments = filteredPayments.filter(p => p.method === 'card')
    const onlinePayments = filteredPayments.filter(p => p.method === 'online')
    
    const cashAmount = cashPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const cardAmount = cardPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const onlineAmount = onlinePayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    return {
      totalInvoices,
      totalAmount,
      paidCount: paidInvoices.length,
      paidAmount,
      pendingCount: pendingInvoices.length,
      pendingAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
      totalPayments,
      totalPaymentAmount,
      cashCount: cashPayments.length,
      cashAmount,
      cardCount: cardPayments.length,
      cardAmount,
      onlineCount: onlinePayments.length,
      onlineAmount,
      collectionRate: totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0
    }
  }, [filteredData])

  // Format date range label
  const getDateRangeLabel = useCallback(() => {
    const { startDate, endDate } = getDateRange()
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    
    switch (reportType) {
      case 'daily':
        return startDate.toLocaleDateString('en-IN', options)
      case 'weekly':
        return `${startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-IN', options)}`
      case 'monthly':
        return startDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
      case 'yearly':
        return startDate.getFullYear().toString()
      default:
        return startDate.toLocaleDateString('en-IN', options)
    }
  }, [getDateRange, reportType])

  // Generate PDF Report
  const generatePdfReport = useCallback(() => {
    setGeneratingPdf(true)
    
    try {
      const { filteredInvoices, filteredPayments } = filteredData
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 15

      // ── Header ──
      doc.setFillColor(15, 23, 42) // slate-900
      doc.rect(0, 0, pageWidth, 40, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('Billing Report', 14, y + 8)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Report Period: ${getDateRangeLabel()}`, 14, y + 16)
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, y + 22)
      
      // Report type badge
      doc.setFontSize(9)
      const badgeText = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`
      const badgeWidth = doc.getTextWidth(badgeText) + 8
      doc.setFillColor(59, 130, 246) // blue-500
      doc.roundedRect(pageWidth - badgeWidth - 14, y + 2, badgeWidth, 8, 2, 2, 'F')
      doc.text(badgeText, pageWidth - badgeWidth - 10, y + 8)

      y = 48

      // ── Revenue Summary Section ──
      doc.setTextColor(30, 41, 59) // slate-800
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Revenue Summary', 14, y)
      y += 2
      doc.setDrawColor(59, 130, 246)
      doc.setLineWidth(0.5)
      doc.line(14, y, 80, y)
      y += 8

      // Summary boxes
      const boxWidth = (pageWidth - 42) / 4
      const boxes = [
        { label: 'Total Revenue', value: `Rs. ${stats.totalAmount.toLocaleString('en-IN')}`, color: [34, 197, 94] },
        { label: 'Collected', value: `Rs. ${stats.totalPaymentAmount.toLocaleString('en-IN')}`, color: [59, 130, 246] },
        { label: 'Pending', value: `Rs. ${stats.pendingAmount.toLocaleString('en-IN')}`, color: [234, 179, 8] },
        { label: 'Collection Rate', value: `${stats.collectionRate.toFixed(1)}%`, color: [168, 85, 247] }
      ]

      boxes.forEach((box, i) => {
        const x = 14 + i * (boxWidth + 4)
        doc.setFillColor(248, 250, 252) // slate-50
        doc.roundedRect(x, y, boxWidth, 22, 2, 2, 'F')
        doc.setDrawColor(...box.color)
        doc.setLineWidth(0.8)
        doc.line(x, y, x, y + 22)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139) // slate-500
        doc.text(box.label, x + 4, y + 6)
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...box.color)
        doc.text(box.value, x + 4, y + 15)
      })

      y += 32

      // ── Invoice Status Breakdown ──
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Invoice Status Breakdown', 14, y)
      y += 2
      doc.setDrawColor(59, 130, 246)
      doc.line(14, y, 100, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Status', 'Count', 'Amount (Rs.)', 'Percentage']],
        body: [
          [
            'Paid',
            stats.paidCount.toString(),
            stats.paidAmount.toLocaleString('en-IN'),
            stats.totalInvoices > 0 ? `${((stats.paidCount / stats.totalInvoices) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Pending',
            stats.pendingCount.toString(),
            stats.pendingAmount.toLocaleString('en-IN'),
            stats.totalInvoices > 0 ? `${((stats.pendingCount / stats.totalInvoices) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Overdue',
            stats.overdueCount.toString(),
            stats.overdueAmount.toLocaleString('en-IN'),
            stats.totalInvoices > 0 ? `${((stats.overdueCount / stats.totalInvoices) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Total',
            stats.totalInvoices.toString(),
            stats.totalAmount.toLocaleString('en-IN'),
            '100%'
          ]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'center' }
        },
        // Bold the total row
        didParseCell: function(data) {
          if (data.row.index === 3) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [226, 232, 240] // slate-200
          }
        }
      })

      y = doc.lastAutoTable.finalY + 12

      // ── Payment Methods Breakdown ──
      // Check if we need a new page
      if (y > 220) {
        doc.addPage()
        y = 15
      }

      doc.setTextColor(30, 41, 59)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Methods Breakdown', 14, y)
      y += 2
      doc.setDrawColor(168, 85, 247)
      doc.line(14, y, 105, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Payment Method', 'Transactions', 'Amount (Rs.)', 'Share']],
        body: [
          [
            'Cash',
            stats.cashCount.toString(),
            stats.cashAmount.toLocaleString('en-IN'),
            stats.totalPaymentAmount > 0 ? `${((stats.cashAmount / stats.totalPaymentAmount) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Card',
            stats.cardCount.toString(),
            stats.cardAmount.toLocaleString('en-IN'),
            stats.totalPaymentAmount > 0 ? `${((stats.cardAmount / stats.totalPaymentAmount) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Online',
            stats.onlineCount.toString(),
            stats.onlineAmount.toLocaleString('en-IN'),
            stats.totalPaymentAmount > 0 ? `${((stats.onlineAmount / stats.totalPaymentAmount) * 100).toFixed(1)}%` : '0%'
          ],
          [
            'Total',
            stats.totalPayments.toString(),
            stats.totalPaymentAmount.toLocaleString('en-IN'),
            '100%'
          ]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [88, 28, 135], // purple-900
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'center' }
        },
        didParseCell: function(data) {
          if (data.row.index === 3) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [226, 232, 240]
          }
        }
      })

      y = doc.lastAutoTable.finalY + 12

      // ── Invoices Detail Table ──
      if (filteredInvoices.length > 0) {
        if (y > 200) {
          doc.addPage()
          y = 15
        }

        doc.setTextColor(30, 41, 59)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Invoice Details (${filteredInvoices.length} invoices)`, 14, y)
        y += 2
        doc.setDrawColor(34, 197, 94) // green
        doc.line(14, y, 110, y)
        y += 4

        const invoiceRows = filteredInvoices.map(inv => [
          inv.invoiceNumber || 'N/A',
          inv.patientName || 'N/A',
          inv.patientPhone || 'N/A',
          `Rs. ${(inv.totalAmount || 0).toLocaleString('en-IN')}`,
          (inv.status || 'N/A').charAt(0).toUpperCase() + (inv.status || '').slice(1),
          getSafeDate(inv.createdAt).toLocaleDateString('en-IN')
        ])

        autoTable(doc, {
          startY: y,
          head: [['Invoice #', 'Patient', 'Phone', 'Amount', 'Status', 'Date']],
          body: invoiceRows,
          theme: 'striped',
          headStyles: { 
            fillColor: [15, 23, 42], 
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            fontSize: 8
          },
          bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          columnStyles: {
            0: { cellWidth: 22 },
            3: { halign: 'right' },
            4: { halign: 'center' }
          },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 4) {
              const val = data.cell.raw?.toLowerCase()
              if (val === 'paid') {
                data.cell.styles.textColor = [22, 163, 74] // green
                data.cell.styles.fontStyle = 'bold'
              } else if (val === 'pending') {
                data.cell.styles.textColor = [202, 138, 4] // yellow
                data.cell.styles.fontStyle = 'bold'
              } else if (val === 'overdue') {
                data.cell.styles.textColor = [220, 38, 38] // red
                data.cell.styles.fontStyle = 'bold'
              }
            }
          }
        })

        y = doc.lastAutoTable.finalY + 12
      }

      // ── Payment Transactions Detail ──
      if (filteredPayments.length > 0) {
        if (y > 200) {
          doc.addPage()
          y = 15
        }

        doc.setTextColor(30, 41, 59)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Payment Transactions (${filteredPayments.length} payments)`, 14, y)
        y += 2
        doc.setDrawColor(59, 130, 246)
        doc.line(14, y, 120, y)
        y += 4

        const paymentRows = filteredPayments.map(p => [
          p.invoiceNumber || 'N/A',
          p.patientName || 'N/A',
          `Rs. ${(p.amount || 0).toLocaleString('en-IN')}`,
          (p.method || 'N/A').charAt(0).toUpperCase() + (p.method || '').slice(1),
          p.reference || 'N/A',
          getSafeDate(p.processedAt).toLocaleDateString('en-IN')
        ])

        autoTable(doc, {
          startY: y,
          head: [['Invoice #', 'Patient', 'Amount', 'Method', 'Reference', 'Date']],
          body: paymentRows,
          theme: 'striped',
          headStyles: { 
            fillColor: [88, 28, 135],
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            fontSize: 8
          },
          bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { cellPadding: 3, overflow: 'linebreak' },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' }
          }
        })
      }

      // ── Footer on all pages ──
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.getHeight()
        
        doc.setFillColor(248, 250, 252)
        doc.rect(0, pageHeight - 16, pageWidth, 16, 'F')
        doc.setDrawColor(203, 213, 225)
        doc.line(0, pageHeight - 16, pageWidth, pageHeight - 16)
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text('Life Clinic Management System - Billing Report', 14, pageHeight - 7)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' })
      }

      // Save PDF
      const dateStr = selectedDate
      const fileName = `billing-report-${reportType}-${dateStr}.pdf`
      doc.save(fileName)
      toast.success('PDF report generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF report')
    } finally {
      setGeneratingPdf(false)
    }
  }, [filteredData, stats, selectedDate, reportType, getDateRangeLabel, getSafeDate])

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
              <h1 className="text-xl font-bold">Generate Billing Report</h1>
              <p className="text-sm text-slate-400">Select date and generate PDF report with full statistics</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Date Selection & Generate */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Report Configuration</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
              >
                <option value="daily" className="bg-slate-800 text-white">Daily Report</option>
                <option value="weekly" className="bg-slate-800 text-white">Weekly Report</option>
                <option value="monthly" className="bg-slate-800 text-white">Monthly Report</option>
                <option value="yearly" className="bg-slate-800 text-white">Yearly Report</option>
              </select>
            </div>

            {/* Date Picker — adapts to report type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {reportType === 'daily' ? 'Select Date' : reportType === 'weekly' ? 'Select Any Day In Week' : reportType === 'monthly' ? 'Select Month' : 'Select Year'}
              </label>

              {(reportType === 'daily' || reportType === 'weekly') && (
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all [color-scheme:dark]"
                />
              )}

              {reportType === 'monthly' && (
                <input
                  type="month"
                  value={selectedMonth}
                  max={new Date().toISOString().slice(0, 7)}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all [color-scheme:dark]"
                />
              )}

              {reportType === 'yearly' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year} className="bg-slate-800 text-white">{year}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={generatePdfReport}
                disabled={generatingPdf}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
              >
                {generatingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    <span>Generate PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Selected period label */}
          <div className="mt-4 px-4 py-2 bg-white/5 rounded-lg border border-white/10 inline-flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">
              Report period: <span className="text-white font-medium">{getDateRangeLabel()}</span>
            </span>
          </div>
        </div>

        {/* Key Metrics Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Total Invoices</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400 tabular-nums">{stats.totalInvoices}</p>
            <p className="text-sm text-slate-500 mt-1">In selected period</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-green-400 tabular-nums">₹{stats.totalAmount.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">Invoice value</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Collection Rate</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400 tabular-nums">{stats.collectionRate.toFixed(1)}%</p>
            <p className="text-sm text-slate-500 mt-1">Paid invoices ratio</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Amount Collected</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400 tabular-nums">₹{stats.totalPaymentAmount.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{stats.totalPayments} payments</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Invoice Status Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <span>Invoice Status Breakdown</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <span className="font-medium">Paid</span>
                    <p className="text-xs text-slate-400">{stats.paidCount} invoices</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-400 tabular-nums">₹{stats.paidAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalInvoices > 0 ? ((stats.paidCount / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <span className="font-medium">Pending</span>
                    <p className="text-xs text-slate-400">{stats.pendingCount} invoices</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-yellow-400 tabular-nums">₹{stats.pendingAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalInvoices > 0 ? ((stats.pendingCount / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="font-medium">Overdue</span>
                    <p className="text-xs text-slate-400">{stats.overdueCount} invoices</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-400 tabular-nums">₹{stats.overdueAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalInvoices > 0 ? ((stats.overdueCount / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Payment Methods</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <Banknote className="w-5 h-5 text-green-400" />
                  <div>
                    <span className="font-medium">Cash</span>
                    <p className="text-xs text-slate-400">{stats.cashCount} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-400 tabular-nums">₹{stats.cashAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalPaymentAmount > 0 ? ((stats.cashAmount / stats.totalPaymentAmount) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="font-medium">Card</span>
                    <p className="text-xs text-slate-400">{stats.cardCount} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-400 tabular-nums">₹{stats.cardAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalPaymentAmount > 0 ? ((stats.cardAmount / stats.totalPaymentAmount) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="font-medium">Online</span>
                    <p className="text-xs text-slate-400">{stats.onlineCount} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-400 tabular-nums">₹{stats.onlineAmount.toLocaleString()}</span>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {stats.totalPaymentAmount > 0 ? ((stats.onlineAmount / stats.totalPaymentAmount) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Invoice Preview ({filteredData.filteredInvoices.length} records)</span>
          </h3>
          
          {filteredData.filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No invoices found for this period</p>
              <p className="text-slate-500 text-sm">Try selecting a different date or report type</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Invoice #</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Patient</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filteredInvoices.slice(0, 10).map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-cyan-400">#{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{invoice.patientName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-400 tabular-nums">₹{invoice.totalAmount?.toLocaleString()}</span>
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
                      <td className="py-3 px-4 text-sm text-slate-400 tabular-nums">
                        {getSafeDate(invoice.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.filteredInvoices.length > 10 && (
                <p className="text-center text-slate-400 text-sm mt-4">
                  Showing 10 of {filteredData.filteredInvoices.length} invoices. Generate PDF for complete report.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={generatePdfReport}
            disabled={generatingPdf}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/25"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
          <Link
            to="/receptionist/billing"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            Back to Billing Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
