import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import MedicalHistoryModel from '../../../models/MedicalHistoryModel';

/**
 * PDF Generator Service
 * Handles all PDF generation for the application
 */
export default class PDFGeneratorService {
  
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
   * Helper: Calculate BMI
   */
  static calculateBMI = (height, weight) => {
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  }

  /**
   * Helper: Get BMI category
   */
  static getBMICategory = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Generate Progress Report PDF - Rangka Style
   * Updated with Height, Weight, and BMI
   */
  static generateProgressPDF = async (patientId) => {
    try {
      // Fetch data using MedicalHistoryModel
      const response = await MedicalHistoryModel.getProgressReport(patientId);
      
      if (!response || response.http_code !== 200 || !response.data) {
        throw new Error('Failed to fetch progress report data');
      }
      
      const reportData = response.data;
      const patient = reportData.patient;
      const sessions = reportData.sessions;
      
      if (!patient) {
        throw new Error('Patient data not found');
      }

      if (!sessions || sessions.length === 0) {
        throw new Error('No medical history records found for this patient');
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
      
      // Calculate BMI
      const bmi = this.calculateBMI(patient.height, patient.weight);
      const bmiCategory = this.getBMICategory(bmi);
      
      // Client info with better spacing
      const clientInfo = [
        ['Patient Name:', patient.name || '-'],
        ['Phone Number:', patient.phone || '-'],
        ['Email Address:', patient.email || '-'],
        ['Age:', patient.date_of_birth ? this.calculateAge(patient.date_of_birth) + ' years' : '-'],
        ['Height (cm):', patient.height ? patient.height.toString() : '-'],
        ['Weight (kg):', patient.weight ? patient.weight.toString() : '-'],
        ['BMI:', bmi ? `${bmi} (${bmiCategory})` : '-']
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
        ['Injury Type:', firstSession.service_type || '-'],
        ['Area Concern:', '-'],
        ['Diagnosis:', firstSession.diagnosis_result || '-'],
        ['Range of Motion Impact:', '-'],
        ['Recovery Goals:', firstSession.exercise || '-'],
        ['Expected Recovery Time:', firstSession.recommended_next_session || '-']
      ];

      // Maximum width untuk value text (dalam mm)
      const maxValueWidth = 40;

      assessmentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, rightX, yPos);
        
        doc.setFont('helvetica', 'normal');
        
        // Split text jika terlalu panjang
        const splitValue = doc.splitTextToSize(value, maxValueWidth);
        
        // Print setiap baris
        splitValue.forEach((line, index) => {
          doc.text(line, rightX + 42, yPos + (index * 4.5));
        });
        
        // Update yPos berdasarkan jumlah baris
        yPos += Math.max(5.5, splitValue.length * 4.5);
      });

      yPos = Math.max(yPos, 90); // Adjusted untuk accommodate BMI field
      
      // ========================================
      // HORIZONTAL LINE BEFORE PROGRESS TABLE
      // ========================================
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      
      yPos += 10;
      
      // ========================================
      // PROGRESS TABLE SECTION - CENTERED
      // ========================================
      
      // Progress Table Title (centered)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('The Progress Table', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 3;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text('see how you progress over the week', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0);
      
      // Legend (colored dots) - DI KANAN
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
      // TABLE WITH CENTERED LAYOUT
      // ========================================
      
      const tableHeaders = [
        'Session\n#',
        'Session\nDate',
        'Rangka\nTherapist',
        'Objective Progress',
        'Home Exercise',
        'Recovery Tips',
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
          session.diagnosis_result || '-',
          session.exercise || '-',
          session.additional_notes || '-',
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
          0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, // Session #
          1: { cellWidth: 20, halign: 'center' }, // Date
          2: { cellWidth: 22, halign: 'left' }, // Therapist
          3: { cellWidth: 38, halign: 'left' }, // Objective Progress
          4: { cellWidth: 36, halign: 'left' }, // Home Exercise
          5: { cellWidth: 32, halign: 'left' }, // Recovery Tips
          6: { cellWidth: 14, halign: 'center', fillColor: [255, 250, 235] }, // Pre-Treatment
          7: { cellWidth: 14, halign: 'center', fillColor: [240, 255, 245] }  // Post-Treatment
        },
        margin: { left: 12, right: 12 },
        tableWidth: 'auto',
        didDrawCell: (data) => {
          // Add colored status dot for Pre/Post treatment based on pain level
          if ((data.column.index === 6 || data.column.index === 7) && data.section === 'body') {
            const cellValue = data.cell.raw;
            if (cellValue !== '-' && cellValue !== undefined && cellValue !== null) {
              try {
                const painValue = parseFloat(cellValue);
                if (!isNaN(painValue)) {
                  let color;
                  // Green for low pain (1-3), Yellow for moderate (4-6), Red for high (7-10)
                  if (painValue <= 3) color = [76, 175, 80]; // Green
                  else if (painValue <= 6) color = [255, 193, 7]; // Yellow
                  else color = [255, 77, 77]; // Red
                  
                  doc.setFillColor(...color);
                  
                  const textWidth = doc.getTextWidth(cellValue.toString());
                  const cellPadding = 3;
                  
                  // X: tengah cell
                  const circleX = data.cell.x + (data.cell.width / 2) + (textWidth / 2) + 2.5;
                  // Y: ikut posisi teks di atas
                  const circleY = data.cell.y + cellPadding + 2.5;
                  
                  doc.circle(circleX, circleY, 1.1, 'F');
                }
              } catch (e) {
                console.warn('Error parsing pain value:', cellValue);
              }
            }
          }
        }
      });
      
      // Save PDF
      const safeName = patient.name ? patient.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') : 'patient';
      const fileName = `progress-report-${patient.patient_code || safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  /**
   * Generate Simple Patient Info PDF
   * Quick reference card with patient basic information
   */
  static generatePatientInfoPDF = async (patientData) => {
    try {
      if (!patientData) {
        throw new Error('Patient data is required');
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', pageWidth / 2, 20, { align: 'center' });
      
      // Underline
      doc.setLineWidth(0.5);
      doc.line(20, 25, pageWidth - 20, 25);
      
      let yPos = 35;
      
      // Patient Code
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Code:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(patientData.patient_code || '-', 70, yPos);
      
      yPos += 10;
      
      // Calculate BMI
      const bmi = this.calculateBMI(patientData.height, patientData.weight);
      const bmiCategory = this.getBMICategory(bmi);
      
      // Patient details
      const details = [
        ['Full Name:', patientData.name || '-'],
        ['Date of Birth:', patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString('en-GB') : '-'],
        ['Age:', patientData.date_of_birth ? this.calculateAge(patientData.date_of_birth) + ' years' : '-'],
        ['Gender:', patientData.gender || '-'],
        ['Height (cm):', patientData.height ? patientData.height.toString() : '-'],
        ['Weight (kg):', patientData.weight ? patientData.weight.toString() : '-'],
        ['BMI:', bmi ? `${bmi} (${bmiCategory})` : '-'],
        ['Phone:', patientData.phone || '-'],
        ['Email:', patientData.email || '-'],
        ['Address:', patientData.address || '-']
      ];
      
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        
        // Handle long text
        const splitText = doc.splitTextToSize(value, 120);
        splitText.forEach((line, index) => {
          doc.text(line, 70, yPos + (index * 6));
        });
        
        yPos += Math.max(10, splitText.length * 6);
      });
      
      // Save
      const safeName = patientData.name ? patientData.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') : 'patient';
      const fileName = `patient-info-${patientData.patient_code || safeName}.pdf`;
      doc.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error("Error generating patient info PDF:", error);
      throw error;
    }
  }

  /**
   * Generate BMI Report PDF
   * Detailed BMI analysis and recommendations
   */
  static generateBMIReportPDF = (patientData) => {
    try {
      if (!patientData || !patientData.height || !patientData.weight) {
        throw new Error('Height and weight are required');
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Calculate BMI
      const bmi = this.calculateBMI(patientData.height, patientData.weight);
      const bmiCategory = this.getBMICategory(bmi);
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BMI Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(20, 25, pageWidth - 20, 25);
      
      let yPos = 40;
      
      // Patient Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${patientData.name || '-'}`, 20, yPos);
      yPos += 6;
      doc.text(`Patient Code: ${patientData.patient_code || '-'}`, 20, yPos);
      yPos += 6;
      doc.text(`Age: ${patientData.date_of_birth ? this.calculateAge(patientData.date_of_birth) + ' years' : '-'}`, 20, yPos);
      yPos += 6;
      doc.text(`Gender: ${patientData.gender || '-'}`, 20, yPos);
      
      yPos += 12;
      
      // BMI Calculation
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Body Measurements:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Height: ${patientData.height} cm`, 20, yPos);
      yPos += 6;
      doc.text(`Weight: ${patientData.weight} kg`, 20, yPos);
      
      yPos += 12;
      
      // BMI Result - Highlighted
      doc.setFillColor(240, 248, 255);
      doc.rect(15, yPos - 5, pageWidth - 30, 20, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BMI Result:', 20, yPos);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      doc.text(`${bmi}`, 80, yPos);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`(${bmiCategory})`, 95, yPos);
      
      yPos += 25;
      
      // BMI Categories Reference
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('BMI Categories:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const categories = [
        'Underweight: BMI < 18.5',
        'Normal weight: BMI 18.5 - 24.9',
        'Overweight: BMI 25 - 29.9',
        'Obese: BMI ≥ 30'
      ];
      
      categories.forEach(category => {
        doc.text(`• ${category}`, 25, yPos);
        yPos += 6;
      });
      
      yPos += 10;
      
      // Recommendations based on BMI
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations:', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let recommendations = [];
      
      if (bmi < 18.5) {
        recommendations = [
          'Consider increasing caloric intake with nutrient-dense foods',
          'Consult with a nutritionist for a personalized meal plan',
          'Include strength training exercises',
          'Monitor your weight regularly'
        ];
      } else if (bmi < 25) {
        recommendations = [
          'Maintain your current healthy lifestyle',
          'Continue regular physical activity',
          'Eat a balanced diet',
          'Monitor your weight periodically'
        ];
      } else if (bmi < 30) {
        recommendations = [
          'Consider reducing caloric intake',
          'Increase physical activity to at least 150 minutes per week',
          'Focus on whole foods and reduce processed foods',
          'Consult with a healthcare provider for personalized advice'
        ];
      } else {
        recommendations = [
          'Consult with a healthcare provider or nutritionist',
          'Develop a structured weight loss plan',
          'Incorporate regular physical activity',
          'Monitor for obesity-related health conditions'
        ];
      }
      
      recommendations.forEach(rec => {
        const splitRec = doc.splitTextToSize(`• ${rec}`, pageWidth - 50);
        splitRec.forEach(line => {
          doc.text(line, 25, yPos);
          yPos += 6;
        });
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Note: This BMI report is for informational purposes only. Please consult with a healthcare professional for medical advice.', 
        pageWidth / 2, pageWidth - 10, { align: 'center' });
      
      // Save
      const safeName = patientData.name ? patientData.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') : 'patient';
      const fileName = `bmi-report-${patientData.patient_code || safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return { success: true, fileName, bmi, bmiCategory };
      
    } catch (error) {
      console.error("Error generating BMI report PDF:", error);
      throw error;
    }
  }
}