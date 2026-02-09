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
   */
  static getProgressReport = async (patientId) => {
    try {
      return await ApiRequest.set(`v1/medical-history/progress-report/${patientId}`, "GET");
    } catch (error) {
      console.error("Error fetching progress report:", error);
      throw error;
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
   */
  static generateProgressPDF = async (patientId) => {
    try {
      // Fetch data
      const response = await this.getProgressReport(patientId);
      
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
        ['Diagnosis:', this.truncateText(firstSession.diagnosis_result, 28) || '-'],
        ['Range of Motion Impact:', '-'],
        ['Recovery Goals:', this.truncateText(firstSession.exercise, 28) || '-'],
        ['Expected Recovery Time:', firstSession.recommended_next_session || '-']
      ];
      
      assessmentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, rightX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, rightX + 42, yPos);
        yPos += 5.5;
      });
      
      yPos = 85;
      
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
      const legendStartX = pageWidth - 50; // Position di kanan
      
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
          this.truncateText(session.diagnosis_result, 45) || '-',
          this.truncateText(session.exercise, 40) || '-',
          this.truncateText(session.additional_notes, 35) || '-',
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
                  doc.circle(
                    data.cell.x + data.cell.width - 3.5,
                    data.cell.y + data.cell.height / 2,
                    1.3,
                    'F'
                  );
                }
              } catch (e) {
                console.warn('Error parsing pain value:', cellValue);
              }
            }
          }
        },
        didDrawPage: (data) => {
          // HAPUS SEMUA FOOTER - tidak ada footer sama sekali
          // Tidak ada contact info, hashtags, social media, atau page number
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
   * Helper function to truncate text
   */
  static truncateText = (text, maxLength) => {
    if (!text) return '';
    const stringText = String(text);
    if (stringText.length <= maxLength) return stringText;
    return stringText.substring(0, maxLength) + '...';
  }

  /**
   * Get medical history statistics
   */
  static getMedicalHistoryStats = async (dateFrom = null, dateTo = null) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `v1/medical-history/stats?${queryString}`
        : 'v1/medical-history/stats';
      
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching medical history stats:", error);
      throw error;
    }
  }

  /**
   * Search medical histories
   */
  static searchMedicalHistories = async (query) => {
    try {
      return await ApiRequest.set(`v1/medical-history/search?query=${encodeURIComponent(query)}`, "GET");
    } catch (error) {
      console.error("Error searching medical histories:", error);
      throw error;
    }
  }

  /**
   * Get recent medical histories
   */
  static getRecentMedicalHistories = async (limit = 10) => {
    try {
      return await ApiRequest.set(`v1/medical-history/recent?limit=${limit}`, "GET");
    } catch (error) {
      console.error("Error fetching recent medical histories:", error);
      throw error;
    }
  }

  /**
   * Get upcoming appointments
   */
  static getUpcomingAppointments = async (days = 7) => {
    try {
      return await ApiRequest.set(`v1/medical-history/upcoming?days=${days}`, "GET");
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      throw error;
    }
  }

  /**
   * Get medical histories by date range
   */
  static getMedicalHistoriesByDateRange = async (startDate, endDate) => {
    try {
      return await ApiRequest.set(`v1/medical-history/date-range?startDate=${startDate}&endDate=${endDate}`, "GET");
    } catch (error) {
      console.error("Error fetching medical histories by date range:", error);
      throw error;
    }
  }

  /**
   * Export medical histories to CSV
   */
  static exportMedicalHistoriesCSV = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.patient_id) queryParams.append('patient_id', filters.patient_id);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      if (filters.service_type) queryParams.append('service_type', filters.service_type);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `v1/medical-history/export/csv?${queryString}`
        : 'v1/medical-history/export/csv';
      
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