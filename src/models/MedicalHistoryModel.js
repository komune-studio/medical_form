import ApiRequest from "../utils/ApiRequest";
import MedicalHistoryPDFGenerator from '../utils/MedicalHistoryPDFGenerator';

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
   * Delegates to MedicalHistoryPDFGenerator
   */
  static generateProgressPDF = async (patientId) => {
    try {
      // Fetch data
      const response = await this.getProgressReport(patientId);

      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server. Please try again.');
      }

      // Delegate PDF generation to utility
      return await MedicalHistoryPDFGenerator.generateProgressPDF(response.data);

    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
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
   * ✅ UPDATED: Added recovery_goals field
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
      injury_type: data.injury_type || '',
      area_concern: data.area_concern || '',
      diagnosis_result: data.diagnosis_result || '',
      expected_recovery_time: data.expected_recovery_time || '',
      recovery_goals: data.recovery_goals || '', // ✅ NEW FIELD
      objective_progress: data.objective_progress || '',
      pain_before: data.pain_before !== undefined ? data.pain_before : '',
      pain_after: data.pain_after !== undefined ? data.pain_after : '',
      range_of_motion_impact: data.range_of_motion_impact || '',
      treatments: data.treatments || '',
      exercise: data.exercise || '',
      homework: data.homework || '',
      recovery_tips: data.recovery_tips || '',
      recommended_next_session: data.recommended_next_session || ''
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
      { value: 'Physiotherapy', label: 'Physiotherapy' },
      { value: 'Pilates', label: 'Pilates' }
    ];
  }

  /**
   * Get injury type options
   */
  static getInjuryTypeOptions = () => {
    return [
      { value: '', label: 'Select Injury Type' },
      { value: 'Acute Injury', label: 'Acute Injury' },
      { value: 'Chronic Injury', label: 'Chronic Injury' },
      { value: 'Overuse Injury', label: 'Overuse Injury' },
      { value: 'Sports Injury', label: 'Sports Injury' },
      { value: 'Work-Related Injury', label: 'Work-Related Injury' },
      { value: 'Post-Surgery', label: 'Post-Surgery' },
      { value: 'Other', label: 'Other' }
    ];
  }

  /**
   * Get recommended session options
   */
  static getRecommendedSessionOptions = () => {
    return [
      { value: '', label: 'Select Next Session' },
      { value: 'This week', label: 'This week' },
      { value: 'Next Week', label: 'Next Week' },
      { value: 'Next 2 Weeks', label: 'Next 2 Weeks' },
      { value: 'Next Month', label: 'Next Month' },
      { value: 'Try pilates session', label: 'Try pilates session' }
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