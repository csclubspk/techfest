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

  // White background
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Navy blue outer border (#002147)
  pdf.setDrawColor(0, 33, 71)
  pdf.setLineWidth(6)
  pdf.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S')

  // Gold inner border
  pdf.setDrawColor(255, 215, 0)
  pdf.setLineWidth(1.5)
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S')

  // Watermark
  pdf.setTextColor(0, 0, 0, 0.04)
  pdf.setFontSize(80)
  pdf.setFont('helvetica', 'bold')
  pdf.text('TECHFEST', pageWidth / 2, pageHeight / 2, { 
    align: 'center',
    angle: 0
  })

  // College Header
  pdf.setTextColor(0, 33, 71)
  pdf.setFontSize(13)
  pdf.setFont('times', 'bold')
  pdf.text("Sindhudurg Zilla Shikshan Prasarak Mandal's", pageWidth / 2, 25, { align: 'center' })
  
  pdf.setFontSize(14)
  pdf.text('Shri Pancham Khemraj Mahavidyalaya, Sawantwadi', pageWidth / 2, 32, { align: 'center' })
  
  pdf.setFontSize(11)
  pdf.text('(Autonomous)', pageWidth / 2, 38, { align: 'center' })
  
  pdf.setFontSize(9)
  pdf.setFont('times', 'normal')
  pdf.text('Affiliated to University of Mumbai', pageWidth / 2, 43, { align: 'center' })
  pdf.text("NAAC Re-Accreditated 'A' Grade in 3rd Cycle with 3.06 CGPA (May 2019)", pageWidth / 2, 47, { align: 'center' })
  pdf.text('Website: https://www.spkcollege.org/', pageWidth / 2, 51, { align: 'center' })

  // Red ribbon for certificate title
  pdf.setFillColor(139, 0, 0)
  const ribbonWidth = 160
  const ribbonX = (pageWidth - ribbonWidth) / 2
  pdf.roundedRect(ribbonX, 60, ribbonWidth, 16, 3, 3, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 70, { align: 'center' })

  // Certificate content
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(12)
  pdf.setFont('times', 'normal')
  pdf.text('This is to certify that', pageWidth / 2, 90, { align: 'center' })

  // Participant Name
  pdf.setFontSize(18)
  pdf.setFont('times', 'bold')
  pdf.text(data.userName, pageWidth / 2, 100, { align: 'center' })
  
  pdf.setFontSize(10)
  pdf.setFont('times', 'italic')
  pdf.text('(Name of the Participant)', pageWidth / 2, 105, { align: 'center' })

  // Event details
  pdf.setFontSize(12)
  pdf.setFont('times', 'normal')
  pdf.text('has actively participated in the event', pageWidth / 2, 118, { align: 'center' })

  pdf.setFontSize(16)
  pdf.setFont('times', 'bold')
  pdf.text(data.eventTitle, pageWidth / 2, 128, { align: 'center' })
  
  pdf.setFontSize(10)
  pdf.setFont('times', 'italic')
  pdf.text('(Name of the Event)', pageWidth / 2, 133, { align: 'center' })

  // TechFest info
  pdf.setFontSize(12)
  pdf.setFont('times', 'normal')
  pdf.text('during ', pageWidth / 2 - 52, 145, { align: 'left' })
  pdf.setFont('times', 'bold')
  pdf.text('TechFest 2026', pageWidth / 2 - 25, 145, { align: 'left' })
  pdf.setFont('times', 'normal')
  pdf.text(' organized by the Department of Computer Science,', pageWidth / 2 + 10, 145, { align: 'left' })
  pdf.text('Shri Pancham Khemraj Mahavidyalaya, Sawantwadi.', pageWidth / 2, 152, { align: 'center' })

  // Date
  pdf.setFontSize(11)
  pdf.text(`Date: ${data.eventDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })}`, pageWidth / 2, 165, { align: 'center' })

  // Gold Seal
  const sealX = pageWidth - 45
  const sealY = 120
  pdf.setFillColor(212, 175, 55)
  pdf.circle(sealX, sealY, 15, 'F')
  pdf.setTextColor(0, 33, 71)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('TECHFEST', sealX, sealY - 2, { align: 'center' })
  pdf.text('2026', sealX, sealY + 4, { align: 'center' })

  // Signature lines
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  
  // Left signature (HOD)
  const leftSigX = 60
  const sigY = pageHeight - 30
  pdf.line(leftSigX - 25, sigY, leftSigX + 25, sigY)
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont('times', 'normal')
  pdf.text('HOD', leftSigX, sigY + 5, { align: 'center' })
  pdf.text('Department of Computer Science', leftSigX, sigY + 10, { align: 'center' })

  // Right signature (Principal)
  const rightSigX = pageWidth - 60
  pdf.line(rightSigX - 25, sigY, rightSigX + 25, sigY)
  pdf.text('Principal', rightSigX, sigY + 5, { align: 'center' })

  // Verification ID
  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Verification ID: ${data.verificationId}`, pageWidth / 2, pageHeight - 8, { 
    align: 'center' 
  })

  // Download the PDF
  pdf.save(`TechFest_2026_${data.userName}_${data.eventTitle}_Certificate.pdf`)
}
