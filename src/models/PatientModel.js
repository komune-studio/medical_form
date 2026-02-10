import ApiRequest from "../utils/ApiRequest";

export default class PatientModel {
  static getAllPatients = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.gender) queryParams.append('gender', filters.gender);
      
      // Kirim timeRange langsung ke backend
      if (filters.timeRange) {
        queryParams.append('timeRange', filters.timeRange);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `v1/patient/all?${queryString}` : 'v1/patient/all';
      
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  }

  static getPatientById = async (id) => {
    try {
      return await ApiRequest.set(`v1/patient/${id}`, "GET");
    } catch (error) {
      console.error("Error fetching patient:", error);
      throw error;
    }
  }

  static createPatient = async (data) => {
    try {
      return await ApiRequest.set('v1/patient/create', "POST", data);
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  }

  static updatePatient = async (id, data) => {
    try {
      return await ApiRequest.set(`v1/patient/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  }

  static deletePatient = async (id) => {
    try {
      return await ApiRequest.set(`v1/patient/${id}`, "DELETE");
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw error;
    }
  }

  static exportPatientsCSV = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.gender) queryParams.append('gender', filters.gender);
      if (filters.timeRange) queryParams.append('timeRange', filters.timeRange);
      
      const queryString = queryParams.toString();
      const url = queryString ? `v1/patient/export/csv?${queryString}` : 'v1/patient/export/csv';
      
      return await ApiRequest.set(url, "GET", null, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error("Error exporting patients:", error);
      throw error;
    }
  }

  static validateEmailUnique = async (email, excludeId = null) => {
    try {
      let url = `v1/patient/validate/email?email=${email}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error validating email:", error);
      throw error;
    }
  }

  static validatePhoneUnique = async (phone, excludeId = null) => {
    try {
      let url = `v1/patient/validate/phone?phone=${phone}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }
      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error validating phone:", error);
      throw error;
    }
  }

  static getPatientStats = async () => {
    try {
      return await ApiRequest.set('v1/patient/stats', "GET");
    } catch (error) {
      console.error("Error fetching patient stats:", error);
      throw error;
    }
  }

  static searchPatients = async (query) => {
    try {
      return await ApiRequest.set(`v1/patient/search?query=${query}`, "GET");
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  }

  static getPatientByCode = async (code) => {
    try {
      return await ApiRequest.set(`v1/patient/code?code=${code}`, "GET");
    } catch (error) {
      console.error("Error fetching patient by code:", error);
      throw error;
    }
  }

  static getRecentPatients = async (limit = 10) => {
    try {
      return await ApiRequest.set(`v1/patient/recent?limit=${limit}`, "GET");
    } catch (error) {
      console.error("Error fetching recent patients:", error);
      throw error;
    }
  }
}