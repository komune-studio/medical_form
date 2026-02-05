import ApiRequest from "../utils/ApiRequest";

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
      // Note: Ini perlu endpoint khusus atau bisa pakai patient service
      // Alternatif: get patient by id dan cek response
      const response = await ApiRequest.set(`v1/patient/${patientId}`, "GET");
      return response.http_code === 200 && response.data !== null;
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
      // Note: Butuh endpoint staff API untuk validasi
      // Untuk sementara return true atau implementasi nanti
      return true;
    } catch (error) {
      console.error("Error validating staff:", error);
      return false;
    }
  }

  /**
   * Format medical history data for form
   */
  static formatMedicalHistoryForForm = (data = {}) => {
    return {
      patient_id: data.patient_id || '',
      appointment_date: data.appointment_date || new Date().toISOString().slice(0, 16),
      staff_id: data.staff_id || '',
      service_type: data.service_type || '',
      diagnosis_result: data.diagnosis_result || '',
      pain_before: data.pain_before || '',
      pain_after: data.pain_after || '',
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
    if (!painBefore || !painAfter) return null;
    
    const before = parseInt(painBefore);
    const after = parseInt(painAfter);
    
    if (isNaN(before) || isNaN(after) || before === 0) return null;
    
    const reduction = ((before - after) / before) * 100;
    return Math.round(reduction);
  }

  /**
   * Get pain level description
   */
  static getPainLevelDescription = (painScore) => {
    if (!painScore) return 'Not specified';
    
    const score = parseInt(painScore);
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
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || this.generateExportFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}