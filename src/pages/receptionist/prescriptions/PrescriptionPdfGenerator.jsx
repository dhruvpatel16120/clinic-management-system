import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export const generatePrescriptionPDF = (prescription) => {
  // Create new PDF document
  const doc = new jsPDF()
  
  // Set document properties
  doc.setProperties({
    title: `Prescription - ${prescription.patientName}`,
    subject: 'Medical Prescription',
    author: prescription.doctorName || 'Doctor',
    creator: 'Clinic Management System'
  })

  // Add clinic header
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 139) // Dark blue
  doc.text('LIFE CLINIC', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Professional Healthcare Services', 105, 30, { align: 'center' })
  doc.text('123 Medical Center Drive, Healthcare City, HC 12345', 105, 37, { align: 'center' })
  doc.text('Phone: (555) 123-4567 | Email: info@lifeclinic.com', 105, 44, { align: 'center' })

  // Add prescription header
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text('MEDICAL PRESCRIPTION', 105, 60, { align: 'center' })
  
  // Add horizontal line
  doc.setDrawColor(0, 0, 139)
  doc.setLineWidth(0.5)
  doc.line(20, 65, 190, 65)

  // Patient Information Section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 139)
  doc.text('PATIENT INFORMATION', 20, 80)
  
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  
  // Patient details in a table format
  const patientData = [
    ['Patient Name:', prescription.patientName || 'N/A'],
    ['Age:', `${prescription.patientAge || 'N/A'} years`],
    ['Gender:', prescription.patientGender || 'N/A'],
    ['Phone:', prescription.patientPhone || 'N/A'],
    ['Email:', prescription.patientEmail || 'N/A'],
    ['Prescription Date:', prescription.prescriptionDate || 'N/A'],
    ['Doctor:', prescription.doctorName || 'N/A']
  ]

  doc.autoTable({
    startY: 85,
    head: [],
    body: patientData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [0, 0, 139], cellWidth: 35 },
      1: { textColor: [0, 0, 0], cellWidth: 55 }
    },
    margin: { left: 20, right: 20 },
    tableWidth: 170
  })

  // Diagnosis Section
  let currentY = doc.lastAutoTable.finalY + 15
  
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 139)
  doc.text('DIAGNOSIS & SYMPTOMS', 20, currentY)
  
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  
  if (prescription.diagnosis) {
    currentY += 10
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('Diagnosis:', 20, currentY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    // Split diagnosis into multiple lines if too long
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 160)
    doc.text(diagnosisLines, 20, currentY + 5)
    currentY += (diagnosisLines.length * 5) + 10
  }

  if (prescription.symptoms) {
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('Symptoms:', 20, currentY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    const symptomsLines = doc.splitTextToSize(prescription.symptoms, 160)
    doc.text(symptomsLines, 20, currentY + 5)
    currentY += (symptomsLines.length * 5) + 15
  }

  // Medicines Section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 139)
  doc.text('PRESCRIBED MEDICINES', 20, currentY)
  
  currentY += 10

  if (prescription.medicines && prescription.medicines.length > 0) {
    // Create medicines table
    const medicinesData = prescription.medicines.map(medicine => [
      medicine.name || 'N/A',
      medicine.dosage || 'N/A',
      medicine.frequency || 'N/A',
      medicine.duration || 'N/A',
      medicine.timing ? getTimingLabel(medicine.timing) : 'N/A',
      medicine.specialInstructions || '-'
    ])

    doc.autoTable({
      startY: currentY,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Timing', 'Special Instructions']],
      body: medicinesData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [0, 0, 139],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 22 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 30 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    })

    currentY = doc.lastAutoTable.finalY + 15
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No medicines prescribed', 20, currentY + 10)
    currentY += 20
  }

  // Doctor's Signature Section for Page 1
  currentY = Math.max(currentY, 250) // Ensure minimum position
  
  doc.setDrawColor(0, 0, 139)
  doc.setLineWidth(0.5)
  doc.line(20, currentY, 80, currentY)
  doc.line(120, currentY, 180, currentY)
  
  currentY += 5
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('Doctor\'s Signature', 45, currentY, { align: 'center' })
  doc.text('Date', 145, currentY, { align: 'center' })

  // Footer for Page 1
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This prescription is valid for the specified duration only.', 105, 280, { align: 'center' })
  doc.text('For any queries, please contact the clinic.', 105, 285, { align: 'center' })
  
  // Add page number for Page 1
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Page 1 of 2`, 105, 290, { align: 'center' })

  // Add new page for Instructions and Additional Information
  doc.addPage()

  // Page 2 Header
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 139)
  doc.text('PRESCRIPTION INSTRUCTIONS & NOTES', 105, 20, { align: 'center' })
  
  // Add horizontal line
  doc.setDrawColor(0, 0, 139)
  doc.setLineWidth(0.5)
  doc.line(20, 25, 190, 25)

  // Instructions Section
  let page2Y = 40
  if (prescription.instructions) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 139)
    doc.text('GENERAL INSTRUCTIONS', 20, page2Y)
    
    page2Y += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    const instructionsLines = doc.splitTextToSize(prescription.instructions, 160)
    doc.text(instructionsLines, 20, page2Y)
    page2Y += (instructionsLines.length * 5) + 15
  }

  // Follow-up and Status
  if (prescription.followUpDate || prescription.status) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 139)
    doc.text('FOLLOW-UP & STATUS', 20, page2Y)
    
    page2Y += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    if (prescription.followUpDate) {
      doc.text(`Follow-up Date: ${prescription.followUpDate}`, 20, page2Y)
      page2Y += 8
    }
    
    if (prescription.status) {
      doc.text(`Status: ${prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}`, 20, page2Y)
      page2Y += 8
    }
    
    page2Y += 10
  }

  // Additional Notes
  if (prescription.notes) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 139)
    doc.text('ADDITIONAL NOTES', 20, page2Y)
    
    page2Y += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    const notesLines = doc.splitTextToSize(prescription.notes, 160)
    doc.text(notesLines, 20, page2Y)
    page2Y += (notesLines.length * 5) + 15
  }

  // Doctor's Signature Section for Page 2
  page2Y = Math.max(page2Y, 250) // Ensure minimum position
  
  doc.setDrawColor(0, 0, 139)
  doc.setLineWidth(0.5)
  doc.line(20, page2Y, 80, page2Y)
  doc.line(120, page2Y, 180, page2Y)
  
  page2Y += 5
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('Doctor\'s Signature', 45, page2Y, { align: 'center' })
  doc.text('Date', 145, page2Y, { align: 'center' })

  // Footer for Page 2
  page2Y += 15
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This prescription is valid for the specified duration only.', 105, page2Y, { align: 'center' })
  doc.text('For any queries, please contact the clinic.', 105, page2Y + 8, { align: 'center' })
  
  // Add page number for Page 2
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Page 2 of 2`, 105, 290, { align: 'center' })

  return doc
}

// Helper function to format timing labels
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

// Function to download PDF
export const downloadPrescriptionPDF = (prescription, filename = null) => {
  try {
    const doc = generatePrescriptionPDF(prescription)
    const defaultFilename = `prescription_${prescription.patientName}_${prescription.prescriptionDate}.pdf`
    const finalFilename = filename || defaultFilename.replace(/\s+/g, '_')
    
    doc.save(finalFilename)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}

// Function to open PDF in new tab
export const openPrescriptionPDF = (prescription) => {
  try {
    const doc = generatePrescriptionPDF(prescription)
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    // Open in new tab
    window.open(pdfUrl, '_blank')
    
    // Clean up the URL object after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    
    return true
  } catch (error) {
    console.error('Error opening PDF:', error)
    return false
  }
}

// Function to get PDF as base64 string (useful for embedding)
export const getPrescriptionPDFBase64 = (prescription) => {
  try {
    const doc = generatePrescriptionPDF(prescription)
    return doc.output('datauristring')
  } catch (error) {
    console.error('Error generating PDF base64:', error)
    return null
  }
}

// Function to print PDF directly
export const printPrescriptionPDF = (prescription) => {
  try {
    const doc = generatePrescriptionPDF(prescription)
    doc.autoPrint()
    doc.output('dataurlnewwindow')
    return true
  } catch (error) {
    console.error('Error printing PDF:', error)
    return false
  }
}

export default {
  generatePrescriptionPDF,
  downloadPrescriptionPDF,
  openPrescriptionPDF,
  getPrescriptionPDFBase64,
  printPrescriptionPDF
}
