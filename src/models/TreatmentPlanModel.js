import ApiRequest from "../utils/ApiRequest";

export default class TreatmentPlanModel {
  /**
   * Get all treatment plans with optional filters
   */
  static getAll = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.patient_id) queryParams.append('patient_id', filters.patient_id);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const queryString = queryParams.toString();
      const url = queryString ? `v1/treatment-plan/all?${queryString}` : 'v1/treatment-plan/all';

      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
      throw error;
    }
  }

  /**
   * Get treatment plan by ID
   */
  static getById = async (id) => {
    try {
      return await ApiRequest.set(`v1/treatment-plan/${id}`, "GET");
    } catch (error) {
      console.error("Error fetching treatment plan:", error);
      throw error;
    }
  }

  /**
   * Create new treatment plan
   */
  static create = async (data) => {
    try {
      const { user_id, ...cleanData } = data;
      return await ApiRequest.set('v1/treatment-plan/create', "POST", cleanData);
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      throw error;
    }
  }

  /**
   * Update treatment plan
   */
  static update = async (id, data) => {
    try {
      return await ApiRequest.set(`v1/treatment-plan/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      throw error;
    }
  }

  /**
   * Delete treatment plan
   */
  static deletePlan = async (id) => {
    try {
      return await ApiRequest.set(`v1/treatment-plan/${id}`, "DELETE");
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      throw error;
    }
  }
}
