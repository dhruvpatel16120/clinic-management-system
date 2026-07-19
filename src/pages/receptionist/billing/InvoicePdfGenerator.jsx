import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function InvoicePdfGenerator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const invoiceDoc = await getDoc(doc(db, 'invoices', id))
        if (invoiceDoc.exists()) {
          setInvoice({ id: invoiceDoc.id, ...invoiceDoc.data() })
        } else {
          toast.error('Invoice not found')
          navigate('/receptionist/billing')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching invoice:', error)
        toast.error('Error fetching invoice')
        setLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    }
  }, [id, navigate])

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

  // Generate PDF
  const generatePDF = async () => {
    setGeneratingPdf(true)
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Popup blocked! Please allow popups to generate and print PDF.')
        setGeneratingPdf(false)
        return
      }

      // Generate HTML content for the invoice
      const invoiceHTML = generateInvoiceHTML()

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 0; /* Strip browser default headers & footers */
              }
              body {
                margin: 0;
                padding: 20mm 15mm;
                background-color: #ffffff;
                color: #0f172a;
                font-size: 10pt;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
              tr {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20mm 15mm;
              color: #0f172a;
              line-height: 1.5;
              background-color: #ffffff;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 3px solid #1e3a8a;
              padding-bottom: 12px;
              margin-bottom: 25px;
              position: relative;
            }
            .clinic-brand {
              display: flex;
              flex-direction: column;
            }
            .clinic-name-text {
              font-size: 22pt;
              font-weight: 850;
              color: #1e3a8a;
              line-height: 1.1;
              letter-spacing: -0.02em;
            }
            .clinic-tagline {
              font-size: 9.5pt;
              color: #475569;
              font-style: italic;
              margin-top: 4px;
            }
            .clinic-contact-info {
              text-align: right;
              font-size: 9pt;
              color: #334155;
              line-height: 1.4;
            }
            .gstin-val {
              font-weight: 700;
              color: #0f172a;
            }
            .status-stamp {
              position: absolute;
              top: 5px;
              right: 280px;
              border: 3px double;
              padding: 6px 16px;
              font-size: 14pt;
              font-weight: 900;
              text-transform: uppercase;
              transform: rotate(-10deg);
              opacity: 0.85;
              border-radius: 4px;
            }
            .status-stamp.status-paid {
              color: #166534;
              border-color: #166534;
              background-color: #f0fdf4;
            }
            .status-stamp.status-pending {
              color: #92400e;
              border-color: #92400e;
              background-color: #fffbeb;
            }
            .status-stamp.status-overdue {
              color: #991b1b;
              border-color: #991b1b;
              background-color: #fef2f2;
            }
            .meta-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
              gap: 20px;
            }
            .meta-card {
              flex: 1;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              overflow: hidden;
            }
            .card-header {
              background-color: #f1f5f9;
              padding: 6px 12px;
              font-size: 8.5pt;
              font-weight: 700;
              color: #1e3a8a;
              border-bottom: 1px solid #e2e8f0;
              letter-spacing: 0.05em;
            }
            .card-body {
              padding: 10px 12px;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 3px 0;
              font-size: 9.5pt;
              vertical-align: top;
            }
            .meta-label {
              width: 90px;
              color: #475569;
              font-weight: 600;
            }
            .meta-val {
              color: #0f172a;
            }
            .highlight-val {
              font-family: monospace;
              font-weight: bold;
              color: #2563eb;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            .badge-paid { background-color: #dcfce7; color: #166534; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
            .badge-overdue { background-color: #fee2e2; color: #991b1b; }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
            }
            .items-table th, .items-table td {
              border: 1px solid #cbd5e1;
              padding: 10px 12px;
              text-align: left;
              font-size: 9.5pt;
            }
            .items-table th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #1e293b;
              text-transform: uppercase;
              font-size: 8.5pt;
              letter-spacing: 0.02em;
            }
            .amount-column {
              text-align: right;
            }
            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .summary-container {
              width: 280px;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              overflow: hidden;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 12px;
              font-size: 9.5pt;
              border-bottom: 1px solid #f1f5f9;
            }
            .summary-row:last-child {
              border-bottom: none;
            }
            .summary-row .label {
              font-weight: 600;
              color: #475569;
            }
            .summary-row.total {
              font-size: 12pt;
              font-weight: 800;
              color: #166534;
              border-top: 2px solid #cbd5e1;
              background-color: #f0fdf4;
            }
            .notes-signature-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              page-break-inside: avoid;
              break-inside: avoid;
              gap: 40px;
            }
            .notes-block {
              flex: 1.5;
            }
            .notes-title {
              font-size: 10pt;
              font-weight: 700;
              color: #1e3a8a;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .notes-text {
              font-size: 9pt;
              color: #475569;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 10px;
              border-radius: 6px;
              margin: 0;
            }
            .signature-block {
              flex: 1;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .signature-space {
              height: 55px;
            }
            .signature-line {
              width: 180px;
              border-top: 1.5px solid #94a3b8;
              margin-bottom: 4px;
              font-weight: 700;
              font-size: 9.5pt;
              color: #1e293b;
            }
            .signature-subtitle {
              font-size: 8pt;
              color: #64748b;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 8.5pt;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
        </html>
      `)

      printWindow.document.close()

      // Auto trigger print and close the window
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error generating PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Generate invoice HTML content
  const generateInvoiceHTML = () => {
    if (!invoice) return ''

    const statusInfo = getStatusIcon(invoice.status)

    return `
      <div class="header-container">
        <div class="clinic-brand">
          <div class="clinic-name-text">City Medical Center</div>
          <div class="clinic-tagline">Quality Care • Compassionate Healing</div>
        </div>
        <div class="status-stamp status-${invoice.status}">${invoice.status}</div>
        <div class="clinic-contact-info">
          123 Healthcare Avenue, Medical District<br>
          Phone: +91 98765 43210 | Email: info@citymedical.com<br>
          GSTIN: <span class="gstin-val">27ABCDE1234F1Z5</span>
        </div>
      </div>

      <div class="meta-section">
        <div class="meta-card">
          <div class="card-header">PATIENT DETAILS (BILL TO)</div>
          <div class="card-body">
            <table class="meta-table">
              <tr><td class="meta-label">Name:</td><td class="meta-val">${invoice.patientName || 'N/A'}</td></tr>
              <tr><td class="meta-label">Phone:</td><td class="meta-val">${invoice.patientPhone || 'N/A'}</td></tr>
              <tr><td class="meta-label">Email:</td><td class="meta-val">${invoice.patientEmail || 'N/A'}</td></tr>
              <tr><td class="meta-label">Address:</td><td class="meta-val">${invoice.patientAddress || 'N/A'}</td></tr>
              <tr><td class="meta-label">Status:</td><td class="meta-val">${statusInfo || 'N/A'}</td></tr>
            </table>
          </div>
        </div>

        <div class="meta-card">
          <div class="card-header">INVOICE DETAILS</div>
          <div class="card-body">
            <table class="meta-table">
              <tr><td class="meta-label">Invoice #:</td><td class="meta-val highlight-val">#${invoice.invoiceNumber}</td></tr>
              <tr><td class="meta-label">Date:</td><td class="meta-val">${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><td class="meta-label">Due Date:</td><td class="meta-val">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><td class="meta-label">Status:</td><td class="meta-val"><span class="badge badge-${invoice.status}">${invoice.status}</span></td></tr>
            </table>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount-column" style="width: 80px;">Quantity</th>
            <th class="amount-column" style="width: 130px;">Unit Price (₹)</th>
            <th class="amount-column" style="width: 130px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items?.map(item => `
            <tr>
              <td>${item.description || 'N/A'}</td>
              <td class="amount-column">${item.quantity || 0}</td>
              <td class="amount-column">${item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
              <td class="amount-column">${item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
            </tr>
          `).join('') || '<tr><td colspan="4" style="text-align: center;">No items listed</td></tr>'}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-container">
          <div class="summary-row">
            <span class="label">Subtotal:</span>
            <span>₹${invoice.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
          </div>
          <div class="summary-row">
            <span class="label">Tax (${invoice.taxRate || 0}%):</span>
            <span>₹${invoice.taxAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
          </div>
          ${invoice.discount > 0 ? `
            <div class="summary-row" style="color: #b91c1c;">
              <span class="label" style="color: #b91c1c;">Discount:</span>
              <span>-₹${invoice.discount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span class="label" style="color: #166534;">Total Amount:</span>
            <span>₹${invoice.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
          </div>
        </div>
      </div>

      <div class="notes-signature-container">
        <div class="notes-block">
          ${invoice.notes ? `
            <div class="notes-title">Notes & Terms</div>
            <p class="notes-text">${invoice.notes}</p>
          ` : ''}
        </div>
        <div class="signature-block">
          <div class="signature-space"></div>
          <div class="signature-line">Authorized Signatory</div>
          <div class="signature-subtitle">City Medical Center</div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing City Medical Center! Wishing you a speedy recovery.</p>
        <p>This is a computer generated invoice and does not require physical signature.</p>
      </div>
    `
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Invoice not found</p>
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
              <h1 className="text-xl font-bold">Invoice Preview</h1>
              <p className="text-sm text-slate-400">#{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDF}
              disabled={generatingPdf}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Invoice Preview */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">City Medical Center</h1>
            <p className="text-blue-100">123 Healthcare Avenue, Medical District</p>
            <p className="text-blue-100">Phone: +91 98765 43210 | Email: info@citymedical.com</p>
            <p className="text-blue-100 text-sm">GSTIN: 27ABCDE1234F1Z5</p>
          </div>

          {/* Invoice Content */}
          <div className="p-8">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Bill To</span>
                </h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {invoice.patientName || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {invoice.patientPhone || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {invoice.patientEmail || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {invoice.patientAddress || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Invoice Details</span>
                </h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Invoice #:</span> <span className="font-mono text-blue-600">{invoice.invoiceNumber}</span></p>
                  <p><span className="font-medium">Date:</span> {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="font-medium">Due Date:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Invoice Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-medium">Description</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-medium">Quantity</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-medium">Unit Price (₹)</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{item.description || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity || 0}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right">{item.unitPrice?.toLocaleString() || '0'}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium">{item.amount?.toLocaleString() || '0'}</td>
                      </tr>
                    )) || (
                        <tr>
                          <td colSpan="4" className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                            No items
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{invoice.subtotal?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax ({invoice.taxRate || 0}%):</span>
                  <span>₹{invoice.taxAmount?.toLocaleString() || '0'}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-medium">Discount:</span>
                    <span>-₹{invoice.discount?.toLocaleString() || '0'}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold text-green-600">
                    <span>Total Amount:</span>
                    <span>₹{invoice.totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Notes:</h3>
                <p className="text-gray-600">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>Thank you for choosing City Medical Center!</p>
              <p>For any queries, please contact us at +91 98765 43210</p>
              <p>This is a computer generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/receptionist/billing')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Back to Billing
          </button>
          <button
            onClick={() => navigate('/receptionist/billing/invoices')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            View Invoice List
          </button>
        </div>
      </main>
    </div>
  )
}
