import jsPDF from 'jspdf'

interface CertificateData {
  userName: string
  eventTitle: string
  eventDate: Date
  verificationId: string
}

export const generateCertificate = async (data: CertificateData) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Background gradient effect (simulated with rectangles)
  pdf.setFillColor(10, 10, 20)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Border
  pdf.setDrawColor(59, 130, 246)
  pdf.setLineWidth(2)
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S')

  pdf.setDrawColor(168, 85, 247)
  pdf.setLineWidth(1)
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S')

  // Title
  pdf.setTextColor(59, 130, 246)
  pdf.setFontSize(48)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CERTIFICATE', pageWidth / 2, 40, { align: 'center' })

  pdf.setFontSize(20)
  pdf.setTextColor(168, 85, 247)
  pdf.text('OF PARTICIPATION', pageWidth / 2, 52, { align: 'center' })

  // Body text
  pdf.setTextColor(200, 200, 200)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('This is to certify that', pageWidth / 2, 75, { align: 'center' })

  // Participant name
  pdf.setFontSize(32)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text(data.userName, pageWidth / 2, 90, { align: 'center' })

  // Event details
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 200, 200)
  pdf.text('has successfully participated in', pageWidth / 2, 105, { align: 'center' })

  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(59, 130, 246)
  pdf.text(data.eventTitle, pageWidth / 2, 120, { align: 'center' })

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 200, 200)
  pdf.text(
    `held on ${data.eventDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`,
    pageWidth / 2,
    135,
    { align: 'center' }
  )

  // College branding
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(168, 85, 247)
  pdf.text('SPK COLLEGE', pageWidth / 2, 155, { align: 'center' })

  // Verification ID
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Verification ID: ${data.verificationId}`, pageWidth / 2, pageHeight - 20, { 
    align: 'center' 
  })

  // Signature lines
  pdf.setDrawColor(100, 100, 100)
  pdf.setLineWidth(0.5)
  
  // Left signature
  pdf.line(40, 170, 90, 170)
  pdf.setFontSize(10)
  pdf.setTextColor(150, 150, 150)
  pdf.text('Event Coordinator', 65, 177, { align: 'center' })

  // Right signature
  pdf.line(pageWidth - 90, 170, pageWidth - 40, 170)
  pdf.text('Director, SPK College', pageWidth - 65, 177, { align: 'center' })

  // Download the PDF
  pdf.save(`${data.userName}_${data.eventTitle}_Certificate.pdf`)
}
