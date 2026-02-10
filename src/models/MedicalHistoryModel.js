import ApiRequest from "../utils/ApiRequest";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default class MedicalHistoryModel {
  /**
   * Get all medical histories with optional filters
   */
  static getAllMedicalHistories = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.patient_id) queryParams.append('patient_id', filters.patient_id);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      if (filters.service_type) queryParams.append('service_type', filters.service_type);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      const queryString = queryParams.toString();
      const url = queryString ? `v1/medical-history/all?${queryString}` : 'v1/medical-history/all';
      
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching medical histories:", error);
      throw error;
    }
  }

  /**
   * Get medical history by ID
   */
  static getMedicalHistoryById = async (id) => {
    try {
      return await ApiRequest.set(`v1/medical-history/${id}`, "GET");
    } catch (error) {
      console.error("Error fetching medical history:", error);
      throw error;
    }
  }

  /**
   * Create new medical history
   */
  static createMedicalHistory = async (data) => {
    try {
      return await ApiRequest.set('v1/medical-history/create', "POST", data);
    } catch (error) {
      console.error("Error creating medical history:", error);
      throw error;
    }
  }

  /**
   * Update medical history
   */
  static updateMedicalHistory = async (id, data) => {
    try {
      return await ApiRequest.set(`v1/medical-history/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error updating medical history:", error);
      throw error;
    }
  }

  /**
   * Delete medical history
   */
  static deleteMedicalHistory = async (id) => {
    try {
      return await ApiRequest.set(`v1/medical-history/${id}`, "DELETE");
    } catch (error) {
      console.error("Error deleting medical history:", error);
      throw error;
    }
  }

  /**
   * Get medical histories by patient ID
   */
  static getMedicalHistoriesByPatient = async (patientId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.service_type) queryParams.append('service_type', filters.service_type);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `v1/medical-history/patient/${patientId}?${queryString}`
        : `v1/medical-history/patient/${patientId}`;
      
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching medical histories by patient:", error);
      throw error;
    }
  }

  /**
   * Get patient progress report for PDF generation
   * Updated: Better error handling for 404 and other errors
   */
  static getProgressReport = async (patientId) => {
    try {
      const response = await ApiRequest.set(`v1/medical-history/progress-report/${patientId}`, "GET");
      
      // Check if response indicates no medical history found
      if (response && response.http_code === 404) {
        const errorMsg = response.error_message || 'No medical history found for this patient';
        throw new Error(errorMsg);
      }
      
      // Check for other error codes
      if (response && response.http_code !== 200) {
        const errorMsg = response.error_message || `Failed to fetch progress report (HTTP ${response.http_code})`;
        throw new Error(errorMsg);
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching progress report:", error);
      
      // Re-throw with proper message
      if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to fetch progress report. Please try again.');
      }
    }
  }

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
   */
  static generateProgressPDF = async (patientId) => {
    try {
      // Fetch data - this will now throw proper errors
      const response = await this.getProgressReport(patientId);
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      const reportData = response.data;
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

      yPos = Math.max(yPos, 85); // Pastikan yPos minimal di 85 untuk konsistensi layout
      
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
          0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 22, halign: 'left' },
          3: { cellWidth: 38, halign: 'left' },
          4: { cellWidth: 36, halign: 'left' },
          5: { cellWidth: 32, halign: 'left' },
          6: { cellWidth: 14, halign: 'center', fillColor: [255, 250, 235] },
          7: { cellWidth: 14, halign: 'center', fillColor: [240, 255, 245] }
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
                  if (painValue <= 3) color = [76, 175, 80]; // Green
                  else if (painValue <= 6) color = [255, 193, 7]; // Yellow
                  else color = [255, 77, 77]; // Red
                  
                  doc.setFillColor(...color);
                  
                  const textWidth = doc.getTextWidth(cellValue.toString());
                  const cellPadding = 3;
                  
                  const circleX = data.cell.x + (data.cell.width / 2) + (textWidth / 2) + 2.5;
                  const circleY = data.cell.y + cellPadding + 2.5;
                  
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

  /**
   * Export medical histories to CSV
   */
  static exportMedicalHistoriesToCSV = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.patient_id) queryParams.append('patient_id', filters.patient_id);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      if (filters.service_type) queryParams.append('service_type', filters.service_type);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `v1/medical-history/export-csv?${queryString}` 
        : 'v1/medical-history/export-csv';
      
      // Note: This should return a blob/file download
      return await ApiRequest.set(url, "GET", null, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error("Error exporting medical histories:", error);
      throw error;
    }
  }

  /**
   * Validate patient exists
   */
  static validatePatientExists = async (patientId) => {
    try {
      const response = await ApiRequest.set(`v1/patient/${patientId}`, "GET");
      return response && response.http_code === 200 && response.data !== null;
    } catch (error) {
      console.error("Error validating patient:", error);
      return false;
    }
  }

  /**
   * Validate staff exists
   */
  static validateStaffExists = async (staffId) => {
    try {
      // This should call your actual staff validation endpoint
      const response = await ApiRequest.set(`v1/staff/${staffId}`, "GET");
      return response && response.http_code === 200 && response.data !== null;
    } catch (error) {
      console.error("Error validating staff:", error);
      return false;
    }
  }

  /**
   * Format medical history data for form
   */
  static formatMedicalHistoryForForm = (data = {}) => {
    // Convert date string to format compatible with datetime-local input
    const formatDateTimeForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format: YYYY-MM-DDThh:mm
      const pad = (num) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    
    return {
      patient_id: data.patient_id || '',
      appointment_date: data.appointment_date ? formatDateTimeForInput(data.appointment_date) : new Date().toISOString().slice(0, 16),
      staff_id: data.staff_id || '',
      service_type: data.service_type || '',
      diagnosis_result: data.diagnosis_result || '',
      pain_before: data.pain_before !== undefined ? data.pain_before : '',
      pain_after: data.pain_after !== undefined ? data.pain_after : '',
      treatments: data.treatments || '',
      exercise: data.exercise || '',
      homework: data.homework || '',
      recommended_next_session: data.recommended_next_session || '',
      additional_notes: data.additional_notes || ''
    };
  }

  /**
   * Validate medical history data before submission
   */
  static validateMedicalHistoryData = (data) => {
    const errors = {};
    
    if (!data.patient_id) {
      errors.patient_id = 'Patient is required';
    }
    
    if (!data.appointment_date) {
      errors.appointment_date = 'Appointment date is required';
    }
    
    if (data.pain_before !== undefined && data.pain_before !== '') {
      const pain = parseInt(data.pain_before);
      if (isNaN(pain) || pain < 1 || pain > 10) {
        errors.pain_before = 'Pain scale must be between 1 and 10';
      }
    }
    
    if (data.pain_after !== undefined && data.pain_after !== '') {
      const pain = parseInt(data.pain_after);
      if (isNaN(pain) || pain < 1 || pain > 10) {
        errors.pain_after = 'Pain scale must be between 1 and 10';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Calculate pain reduction percentage
   */
  static calculatePainReduction = (painBefore, painAfter) => {
    if (painBefore === undefined || painBefore === null || 
        painAfter === undefined || painAfter === null || 
        painBefore === '' || painAfter === '') {
      return null;
    }
    
    const before = parseFloat(painBefore);
    const after = parseFloat(painAfter);
    
    if (isNaN(before) || isNaN(after) || before === 0) return null;
    
    const reduction = ((before - after) / before) * 100;
    return Math.round(reduction * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get pain level description
   */
  static getPainLevelDescription = (painScore) => {
    if (painScore === undefined || painScore === null || painScore === '') {
      return 'Not specified';
    }
    
    const score = parseFloat(painScore);
    if (isNaN(score)) return 'Invalid score';
    
    if (score <= 3) return 'Mild';
    if (score <= 6) return 'Moderate';
    if (score <= 9) return 'Severe';
    return 'Very Severe';
  }

  /**
   * Format appointment date for display
   */
  static formatAppointmentDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get service type options
   */
  static getServiceTypeOptions = () => {
    return [
      { value: '', label: 'Select Service Type' },
      { value: 'Consultation', label: 'Consultation' },
      { value: 'Therapy', label: 'Therapy' },
      { value: 'Follow-up', label: 'Follow-up' },
      { value: 'Emergency', label: 'Emergency' },
      { value: 'Check-up', label: 'Check-up' },
      { value: 'Rehabilitation', label: 'Rehabilitation' },
      { value: 'Screening', label: 'Screening' }
    ];
  }

  /**
   * Get recommended session options
   */
  static getRecommendedSessionOptions = () => {
    return [
      { value: '', label: 'Select Next Session' },
      { value: '1 day', label: '1 day' },
      { value: '2 days', label: '2 days' },
      { value: '3 days', label: '3 days' },
      { value: '1 week', label: '1 week' },
      { value: '2 weeks', label: '2 weeks' },
      { value: '3 weeks', label: '3 weeks' },
      { value: '1 month', label: '1 month' },
      { value: 'Follow-up as needed', label: 'Follow-up as needed' }
    ];
  }

  /**
   * Generate CSV filename with timestamp
   */
  static generateExportFilename = (prefix = 'medical_histories') => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    return `${prefix}_${timestamp}.csv`;
  }

  /**
   * Download CSV file from blob
   */
  static downloadCSV = (blobData, filename = null) => {
    try {
      if (!blobData) {
        throw new Error('No data to download');
      }
      
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || this.generateExportFilename();
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Error downloading CSV:", error);
      throw error;
    }
  }

  /**
   * Generate monthly report data
   */
  static generateMonthlyReport = async (year, month) => {
    try {
      return await ApiRequest.set(`v1/medical-history/monthly-report?year=${year}&month=${month}`, "GET");
    } catch (error) {
      console.error("Error generating monthly report:", error);
      throw error;
    }
  }

  /**
   * Get pain statistics for a patient
   */
  static getPatientPainStatistics = async (patientId) => {
    try {
      return await ApiRequest.set(`v1/medical-history/pain-stats/${patientId}`, "GET");
    } catch (error) {
      console.error("Error fetching pain statistics:", error);
      throw error;
    }
  }
}