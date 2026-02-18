import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default class MedicalHistoryPDFGenerator {
  /**
   * Helper: Calculate age from date of birth
   */
  static calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return 'Invalid date';
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Generate Progress Report PDF - Rangka Style (Improved Layout)
   * ✅ UPDATED: Now uses base64 images from backend (NO CORS ISSUES!)
   * ✅ UPDATED: Added 4 new fields (injury_type, expected_recovery_time, objective_progress, recovery_goals)
   * ✅ REMOVED: additional_notes
   */
  static generateProgressPDF = async (reportData) => {
    try {
      // Validate data
      if (!reportData) {
        throw new Error('Invalid report data provided.');
      }
      
      const patient = reportData.patient;
      const sessions = reportData.sessions;
      
      // Check if patient data exists
      if (!patient) {
        throw new Error('Patient information not found. Please contact support.');
      }

      // Check if sessions exist
      if (!sessions || sessions.length === 0) {
        throw new Error('No medical history records found for this patient. Please add treatment records first.');
      }
      
      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // ========================================
      // HEADER SECTION
      // ========================================
      
      // Title (centered, bold, large)
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Treatment Plan & Progress Report:', pageWidth / 2, 18, { align: 'center' });
      
      // Underline below title
      doc.setLineWidth(1);
      doc.line(20, 22, pageWidth - 20, 22);
      
      // ========================================
      // TWO COLUMN LAYOUT
      // ========================================
      
      let leftX = 20;
      let rightX = 112;
      let yPos = 32;
      
      // ========== LEFT COLUMN: CLIENT'S DATA ==========
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("Client's Data:", leftX, yPos);
      
      yPos += 7;
      doc.setFontSize(9);
      
      // Client info with better spacing
      const clientInfo = [
        ['Patient Name:', patient.name || '-'],
        ['Phone Number:', patient.phone || '-'],
        ['Email Address:', patient.email || '-'],
        ['Age:', patient.date_of_birth ? this.calculateAge(patient.date_of_birth) + ' years' : '-'],
        ['Height (cm):', patient.height || '-'],
        ['Weight (kg):', patient.weight || '-']
      ];
      
      clientInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, leftX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, leftX + 32, yPos);
        yPos += 5.5;
      });
      
      // ========== RIGHT COLUMN: RANGKA ASSESSMENT ==========
      yPos = 32;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("Rangka Assessment:", rightX, yPos);

      yPos += 7;
      doc.setFontSize(9);

      // Get first session for assessment data
      const firstSession = sessions[0] || {};

      const assessmentInfo = [
        ['Assessment Date:', firstSession.appointment_date ? new Date(firstSession.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'],
        ['Assessment Therapist:', firstSession.staff_name || '-'],
        ['Service Type:', firstSession.service_type || '-'],
        ['Injury Type:', firstSession.injury_type || '-'],
        ['Area Concern:', firstSession.area_concern || '-'],
        ['Diagnosis:', firstSession.diagnosis_result || '-'],
        ['Range of Motion Impact:', firstSession.range_of_motion_impact || '-'],
        ['Recovery Goals:', firstSession.recovery_goals || '-'],
        ['Expected Recovery Time:', firstSession.expected_recovery_time || '-']
      ];

      // Maximum width for value text (in mm)
      const maxValueWidth = 40;

      assessmentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, rightX, yPos);
        
        doc.setFont('helvetica', 'normal');
        
        // Split text if too long
        const splitValue = doc.splitTextToSize(value, maxValueWidth);
        
        // Print each line
        splitValue.forEach((line, index) => {
          doc.text(line, rightX + 42, yPos + (index * 4.5));
        });
        
        // Update yPos based on number of lines
        yPos += Math.max(5.5, splitValue.length * 4.5);
      });

      yPos = Math.max(yPos, 98);
      
      // ========================================
      // HORIZONTAL LINE BEFORE PROGRESS TABLE
      // ========================================
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      yPos += 6; // Move table UP
      
      // ========================================
      // PROGRESS TABLE SECTION - CENTERED
      // ========================================
      
      // Progress Table Title (centered)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('The Progress Table', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5; // Move subtitle DOWN
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text('see how you progress over the week', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0);
      
      // Legend (colored dots) - ON RIGHT
      const legendY = yPos + 4;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      // Legend items - positioned on right side
      const legendItems = [
        { color: [255, 77, 77], label: ': Treatment + Rest' },
        { color: [255, 193, 7], label: ': Treatment + Exercise' },
        { color: [76, 175, 80], label: ': Back to Sports Preparation' }
      ];
      
      // Position legend on the right side
      const legendStartX = pageWidth - 50;
      
      // Draw legend items on right side
      legendItems.forEach((item, index) => {
        const itemY = legendY + (index * 4);
        
        // Draw colored dot
        doc.setFillColor(...item.color);
        doc.circle(legendStartX - 3, itemY - 0.5, 1.2, 'F');
        
        // Draw text
        doc.text(item.label, legendStartX, itemY);
      });
      
      yPos = legendY + 15;
      
      // ========================================
      // TABLE WITH CENTERED LAYOUT - UPDATED COLUMNS
      // ========================================
      
      const tableHeaders = [
        'Session\n#',
        'Session\nDate',
        'Rangka\nTherapist',
        'Objective\nProgress',
        'Home\nExercise',
        'Recovery\nTips',
        'Pre-\nTreatment',
        'Post-\nTreatment'
      ];
      
      const tableData = sessions.map((session, index) => {
        let formattedDate = '-';
        if (session.appointment_date) {
          try {
            const sessionDate = new Date(session.appointment_date);
            if (!isNaN(sessionDate.getTime())) {
              formattedDate = sessionDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }
          } catch (e) {
            console.warn('Invalid date format:', session.appointment_date);
          }
        }
      
        return [
          (index + 1).toString(),
          formattedDate,
          session.staff_name || '-',
          session.objective_progress || '-',
          session.exercise || '-',
          session.recovery_tips || '-',
          session.pain_before !== null && session.pain_before !== undefined ? session.pain_before.toString() : '-',
          session.pain_after !== null && session.pain_after !== undefined ? session.pain_after.toString() : '-'
        ];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [tableHeaders],
        body: tableData,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 7.5,
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          lineColor: [220, 220, 220],
          lineWidth: 0.3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [250, 250, 250],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center',
          valign: 'middle',
          minCellHeight: 10
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [40, 40, 40],
          valign: 'top'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 22, halign: 'left' },
          3: { cellWidth: 38, halign: 'left' },
          4: { cellWidth: 32, halign: 'left' },
          5: { cellWidth: 30, halign: 'left' },
          6: { cellWidth: 14, halign: 'center', fillColor: [255, 250, 235] },
          7: { cellWidth: 14, halign: 'center', fillColor: [240, 255, 245] }
        },
        margin: { left: 12, right: 12 },
        tableWidth: 'auto',
        didDrawCell: (data) => {
          if ((data.column.index === 6 || data.column.index === 7) && data.section === 'body') {
            const cellValue = data.cell.raw;
            if (cellValue !== '-' && cellValue !== undefined && cellValue !== null) {
              try {
                const painValue = parseFloat(cellValue);
                if (!isNaN(painValue)) {
                  let color;
                  if (painValue <= 3) color = [76, 175, 80];
                  else if (painValue <= 6) color = [255, 193, 7];
                  else color = [255, 77, 77];
        
                  // ✅ Ikut posisi TEKS, bukan tengah cell
                  const paddingTop = data.cell.padding('top');
                  const fontSize = 7;
                  const textY = data.cell.y + paddingTop + (fontSize * 0.352778);
        
                  // Horizontal: angka sudah digambar autoTable di center
                  // Kita tinggal taruh dot di kanannya
                  const textWidth = doc.getTextWidth(cellValue.toString());
                  const circleX = data.cell.x + (data.cell.width / 2) + (textWidth / 2) + 2.5;
                  const circleY = textY - (fontSize * 0.352778) / 2; // ✅ sejajar tengah angka
        
                  doc.setFillColor(...color);
                  doc.circle(circleX, circleY, 1.1, 'F');
                }
              } catch (e) {
                console.warn('Error parsing pain value:', cellValue);
              }
            }
          }
        },
        didDrawPage: (data) => {
          // No footer
        }
      });
      
      // ========================================
      // BODY ANNOTATION IMAGES - AFTER TABLE
      // ✅ UPDATED: Uses base64 images from backend
      // ========================================
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Process each session's body annotation
      for (let index = 0; index < sessions.length; index++) {
        const session = sessions[index];
        
        // ✅ USE BASE64 IMAGE FROM BACKEND (No CORS issues!)
        const imageData = session.body_annotation_base64 || session.body_annotation_url;
        
        console.log(`Session ${index + 1}:`, {
          hasBase64: !!session.body_annotation_base64,
          hasUrl: !!session.body_annotation_url,
          imageDataLength: imageData ? imageData.length : 0
        });
        
        if (imageData && imageData.trim() !== '') {
          try {
            // Check if we need a new page for the image
            if (yPos > pageHeight - 80) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Session ${index + 1} - Body Annotation:`, 20, yPos);
            yPos += 7;
            
            // Check if it's base64 or URL
            const isBase64 = imageData.startsWith('data:image');
            
            if (isBase64) {
              // ✅ DIRECT USE - Base64 image (recommended)
              console.log(`✅ Using base64 image for session ${index + 1}`);
              
              // Calculate image dimensions (default size)
              const maxWidth = 120;
              const maxHeight = 100;
              
              // For base64, we use default dimensions
              const imgWidth = maxWidth;
              const imgHeight = maxHeight;
              
              // Center the image
              const imgX = (pageWidth - imgWidth) / 2;
              
              console.log(`Adding base64 image to PDF: ${imgWidth}x${imgHeight} at position (${imgX}, ${yPos})`);
              
              // Add base64 image directly to PDF
              doc.addImage(
                imageData,
                'JPEG',
                imgX,
                yPos,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
              );
              
              yPos += imgHeight + 10;
              
            } else {
              // ⚠️ FALLBACK - URL image (might have CORS issues)
              console.warn(`⚠️ Falling back to URL image for session ${index + 1} (CORS might fail)`);
              
              const img = await new Promise((resolve, reject) => {
                const image = new window.Image();
                image.crossOrigin = 'Anonymous';
                
                image.onload = () => {
                  console.log(`URL image loaded successfully for session ${index + 1}`);
                  resolve(image);
                };
                image.onerror = (err) => {
                  console.error(`Failed to load URL image for session ${index + 1}:`, err);
                  reject(new Error('Failed to load image - CORS blocked or image not found'));
                };
                
                image.src = imageData;
              });
              
              // Calculate image dimensions
              const maxWidth = 120;
              const maxHeight = 100;
              
              let imgWidth = maxWidth;
              let imgHeight = (img.height * maxWidth) / img.width;
              
              if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = (img.width * maxHeight) / img.height;
              }
              
              // Center the image
              const imgX = (pageWidth - imgWidth) / 2;
              
              console.log(`Adding URL image to PDF: ${imgWidth}x${imgHeight} at position (${imgX}, ${yPos})`);
              
              doc.addImage(
                img,
                'JPEG',
                imgX,
                yPos,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
              );
              
              yPos += imgHeight + 10;
            }
            
          } catch (error) {
            console.error(`❌ Error loading body annotation image for session ${index + 1}:`, error);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('(Body annotation image unavailable - CORS blocked or image not found)', 20, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;
          }
        } else {
          // No body_annotation data for this session
          console.log(`Session ${index + 1}: No body annotation image found`);
        }
      }
      
      // Save PDF
      const safeName = patient.name ? patient.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') : 'patient';
      const fileName = `progress-report-${patient.patient_code || safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Re-throw with user-friendly message
      if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to generate PDF report. Please try again.');
      }
    }
  }
}
