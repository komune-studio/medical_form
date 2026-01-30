import ApiRequest from "utils/ApiRequest";

export default class StaffModel {
  // =============== HELPER METHOD ===============
  static handleResponse = (response) => {
    // Check berbagai kemungkinan response structure
    if (!response) return null;
    
    // Jika response langsung array (misal: [staff1, staff2])
    if (Array.isArray(response)) {
      return {
        http_code: 200,
        data: response,
        success: true
      };
    }
    
    // Jika response punya http_code/statusCode
    if (response.http_code || response.statusCode) {
      return response;
    }
    
    // Jika response punya data property
    if (response.data !== undefined) {
      return {
        http_code: 200,
        data: response.data,
        success: true
      };
    }
    
    // Default: anggap response adalah data langsung
    return {
      http_code: 200,
      data: response,
      success: true
    };
  }

  // =============== STAFF CRUD ===============
  
  // Get all active staff (untuk dropdown)
  static getActiveStaff = async () => {
    try {
      const response = await ApiRequest.set(`v1/staff/active`, "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error getActiveStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to fetch active staff",
        data: []
      };
    }
  };

  // Get all staff dengan filter
  static getAllStaff = async (params = {}) => {
    try {
      let queryString = "";
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params).toString();
        queryString = `?${queryParams}`;
      }
      const response = await ApiRequest.set(`v1/staff/all${queryString}`, "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error getAllStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to fetch staff",
        data: []
      };
    }
  };

  // Get staff by ID
  static getStaffById = async (id) => {
    try {
      const response = await ApiRequest.set(`v1/staff/${id}`, "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error getStaffById:", error);
      return {
        http_code: error.http_code || 404,
        error_message: error.error_message || "Staff not found",
        data: null
      };
    }
  };

  // Create new staff
  static createStaff = async (body) => {
    try {
      const response = await ApiRequest.set("v1/staff/create", "POST", body);
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error createStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to create staff",
        data: null
      };
    }
  };

  // Update staff
  static updateStaff = async (id, body) => {
    try {
      const response = await ApiRequest.set(`v1/staff/${id}`, "PUT", body);
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error updateStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to update staff",
        data: null
      };
    }
  };

  // Delete/Deactivate staff (soft delete)
  static deleteStaff = async (id) => {
    try {
      const response = await ApiRequest.set(`v1/staff/${id}`, "DELETE");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error deleteStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to delete staff",
        data: null
      };
    }
  };

  // Reactivate staff
  static reactivateStaff = async (id) => {
    try {
      const response = await ApiRequest.set(`v1/staff/${id}/reactivate`, "POST");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error reactivateStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to reactivate staff",
        data: null
      };
    }
  };

  // Search staff
  static searchStaff = async (query) => {
    try {
      const response = await ApiRequest.set(`v1/staff/search?query=${encodeURIComponent(query)}`, "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error searchStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to search staff",
        data: []
      };
    }
  };

  // Get staff by name
  static getStaffByName = async (name) => {
    try {
      const response = await ApiRequest.set(`v1/staff/by-name?name=${encodeURIComponent(name)}`, "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error getStaffByName:", error);
      return {
        http_code: error.http_code || 404,
        error_message: error.error_message || "Staff not found",
        data: null
      };
    }
  };

  // =============== VALIDATION HELPER ===============
  static validateStaffData = (data) => {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
      errors.name = "Staff name is required";
    }

    if (!data.phone_number || data.phone_number.trim() === "") {
      errors.phone_number = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9+()-]+$/;
      if (!phoneRegex.test(data.phone_number)) {
        errors.phone_number = "Invalid phone number format";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // =============== FORM TRANSFORMER ===============
  static transformStaffFormData = (formData) => {
    return {
      name: formData.name?.trim() || "",
      phone_number: formData.phone_number?.trim() || "",
      active: formData.active !== undefined ? formData.active : true
    };
  };

  static transformStaffForTable = (staff) => {
    if (!staff) return {};
    
    return {
      id: staff.id,
      name: staff.name,
      phone: staff.phone_number,
      active: staff.active ? "Active" : "Inactive",
      activeStatus: staff.active,
      createdAt: staff.created_at ? new Date(staff.created_at).toLocaleString() : "",
      modifiedAt: staff.modified_at ? new Date(staff.modified_at).toLocaleString() : ""
    };
  };

  // =============== DROPDOWN OPTIONS ===============
  static getStaffForDropdown = async () => {
    try {
      const result = await this.getActiveStaff();
      if (result && result.http_code === 200) {
        return result.data.map(staff => ({
          value: staff.id,
          label: `${staff.name} - ${staff.phone_number}`,
          data: staff
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getStaffForDropdown:", error);
      return [];
    }
  };

  // =============== STATS ===============
  static getStaffStats = async () => {
    try {
      const response = await ApiRequest.set("v1/staff/stats", "GET");
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error getStaffStats:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to fetch staff stats",
        data: null
      };
    }
  };

  // =============== BULK OPERATIONS ===============
  static bulkActivateStaff = async (ids) => {
    try {
      const response = await ApiRequest.set("v1/staff/bulk/activate", "POST", { ids });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error bulkActivateStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to activate staff",
        data: null
      };
    }
  };

  static bulkDeactivateStaff = async (ids) => {
    try {
      const response = await ApiRequest.set("v1/staff/bulk/deactivate", "POST", { ids });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Error bulkDeactivateStaff:", error);
      return {
        http_code: error.http_code || 500,
        error_message: error.error_message || "Failed to deactivate staff",
        data: null
      };
    }
  };

  // =============== EXPORT/IMPORT ===============
  static exportStaffToCSV = (staffList) => {
    if (!staffList || staffList.length === 0) return "";
    
    const headers = ["ID", "Name", "Phone Number", "Status", "Created At", "Modified At"];
    const rows = staffList.map(staff => [
      staff.id,
      `"${staff.name}"`,
      `"${staff.phone_number}"`,
      staff.active ? "Active" : "Inactive",
      staff.created_at ? new Date(staff.created_at).toLocaleString() : "",
      staff.modified_at ? new Date(staff.modified_at).toLocaleString() : ""
    ]);
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  // =============== UTILITY METHODS ===============
  static mapStaffById = (staffList) => {
    if (!Array.isArray(staffList)) return {};
    
    const map = {};
    staffList.forEach(staff => {
      map[staff.id] = staff;
    });
    return map;
  };

  static getActiveStaffCount = (staffList) => {
    if (!Array.isArray(staffList)) return 0;
    return staffList.filter(staff => staff.active).length;
  };

  static searchStaffByNameOrPhone = (staffList, searchTerm) => {
    if (!Array.isArray(staffList) || !searchTerm) return staffList;
    
    const term = searchTerm.toLowerCase();
    return staffList.filter(staff => 
      staff.name.toLowerCase().includes(term) || 
      staff.phone_number.toLowerCase().includes(term)
    );
  };

  // =============== CACHE MANAGEMENT ===============
  static cacheStaffData = (staffList) => {
    if (Array.isArray(staffList)) {
      try {
        localStorage.setItem('staff_cache', JSON.stringify({
          data: staffList,
          timestamp: new Date().getTime()
        }));
      } catch (error) {
        console.error("Error caching staff data:", error);
      }
    }
  };

  static getCachedStaffData = () => {
    try {
      const cached = localStorage.getItem('staff_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache valid untuk 5 menit
        if (new Date().getTime() - parsed.timestamp < 5 * 60 * 1000) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting cached staff data:", error);
      return null;
    }
  };

  // =============== SYNC METHODS ===============
  static syncStaffForVisitorForm = async () => {
    try {
      // Coba ambil dari cache dulu
      const cached = this.getCachedStaffData();
      if (cached) {
        return cached;
      }
      
      // Jika tidak ada cache, fetch dari API
      const result = await this.getActiveStaff();
      if (result && result.http_code === 200) {
        this.cacheStaffData(result.data);
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("Error syncing staff:", error);
      return [];
    }
  };
}

// Optional: Buat instance juga kalo butuh
export const staffModel = new StaffModel();