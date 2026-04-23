import ApiRequest from "../utils/ApiRequest";

export default class TreatmentLogModel {
  /**
   * Get all treatment logs with optional filters
   */
  static getAll = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.treatment_plan_id) queryParams.append('treatment_plan_id', filters.treatment_plan_id);
      if (filters.staff_id) queryParams.append('staff_id', filters.staff_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.created_by) queryParams.append('created_by', filters.created_by);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const queryString = queryParams.toString();
      const url = queryString ? `v1/treatment-log/all?${queryString}` : 'v1/treatment-log/all';

      return await ApiRequest.set(url, "GET");
    } catch (error) {
      console.error("Error fetching treatment logs:", error);
      throw error;
    }
  }

  /**
   * Get treatment log by ID
   */
  static getById = async (id) => {
    try {
      return await ApiRequest.set(`v1/treatment-log/${id}`, "GET");
    } catch (error) {
      console.error("Error fetching treatment log:", error);
      throw error;
    }
  }

  /**
   * Create new treatment log
   */
  static create = async (data) => {
    try {
      return await ApiRequest.set('v1/treatment-log/create', "POST", data);
    } catch (error) {
      console.error("Error creating treatment log:", error);
      throw error;
    }
  }

  /**
   * Update treatment log
   */
  static update = async (id, data) => {
    try {
      return await ApiRequest.set(`v1/treatment-log/${id}`, "PUT", data);
    } catch (error) {
      console.error("Error updating treatment log:", error);
      throw error;
    }
  }

  /**
   * Delete treatment log
   */
  static deleteLog = async (id) => {
    try {
      return await ApiRequest.set(`v1/treatment-log/${id}`, "DELETE");
    } catch (error) {
      console.error("Error deleting treatment log:", error);
      throw error;
    }
  }
}
