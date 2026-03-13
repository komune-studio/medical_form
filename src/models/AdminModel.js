import ApiRequest from "../utils/ApiRequest";

export default class AdminService {

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  static login = async (body) => {
    return await ApiRequest.set('v1/user/login', "POST", body);
  }

  // ─── SELF (any role) ──────────────────────────────────────────────────────

  static getSelf = async () => {
    return await ApiRequest.set("v1/user/self", "GET");
  }

  static resetPasswordSelf = async (body) => {
    // body: { currentPassword, newPassword }
    return await ApiRequest.set(`v1/user/reset-password`, "POST", body);
  }

  static editSelf = async (body) => {
    // body: { username }
    return await ApiRequest.set(`v1/user/profile`, "PUT", body);
  }

  static deleteOwnAccount = async () => {
    return await ApiRequest.set(`v1/user/account`, "DELETE");
  }

  // ─── ADMIN ONLY ───────────────────────────────────────────────────────────

  /**
   * Buat user baru dengan role tertentu (ADMIN / DOCTOR)
   * body: { username, password, role }
   */
  static adminCreateUser = async (body) => {
    return await ApiRequest.set("v1/user/admin/create", "POST", body);
  }

  /** Get semua user aktif */
  static getAll = async () => {
    return await ApiRequest.set("v1/user/all", "GET");
  }

  /** Get semua user termasuk nonaktif */
  static getAllWithInactive = async () => {
    return await ApiRequest.set("v1/user/all-with-inactive", "GET");
  }

  /** Get user by role: ?role=DOCTOR atau ?role=ADMIN */
  static getByRole = async (role) => {
    return await ApiRequest.set(`v1/user/by-role?role=${role}`, "GET");
  }

  /** Get user by ID */
  static getById = async (id) => {
    return await ApiRequest.set(`v1/user/${id}`, "GET");
  }

  /** Ganti role user (ADMIN / DOCTOR) */
  static updateRole = async (id, role) => {
    // body: { role }
    return await ApiRequest.set(`v1/user/${id}/role`, "PATCH", { role });
  }

  /** Reset password user lain (admin) */
  static resetPassword = async (id, body) => {
    // body: { newPassword }
    return await ApiRequest.set(`v1/user/${id}/reset-password`, "PATCH", body);
  }

  /** Soft delete user */
  static delete = async (id) => {
    return await ApiRequest.set(`v1/user/${id}`, "DELETE");
  }

  /** Restore user yang dihapus */
  static restore = async (id) => {
    return await ApiRequest.set(`v1/user/${id}/restore`, "POST");
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────

  /** Ambil role dari localStorage */
  static getLocalRole = () => {
    return localStorage.getItem('role') || null;
  }

  /** Cek apakah user yang login adalah ADMIN */
  static isAdmin = () => {
    return AdminService.getLocalRole() === 'ADMIN';
  }

  /** Cek apakah user yang login adalah DOCTOR */
  static isDoctor = () => {
    return AdminService.getLocalRole() === 'DOCTOR';
  }
}