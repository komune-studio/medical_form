import ApiRequest from "../utils/ApiRequest";

export default class Admin {
  static login = async (body) => {
    return await ApiRequest.set('v1/user/login', "POST", body);
  }

  static createAdmin = async (body) => {
    return await ApiRequest.set("v1/user/create/admin", "POST", body);
  }

  static createSuperAdmin = async (body) => {
    return await ApiRequest.set("v1/user/create/superadmin", "POST", body);
  }

  static getAll = async () => {
    return await ApiRequest.set("v1/user/all", "GET");
  }

  static getSelf = async () => {
    return await ApiRequest.set("v1/user/self", "GET");
  }

  static resetPassword = async (id, body) => {
    return await ApiRequest.set(`v1/user/reset-password/${id}`, "POST", body);
  }

  static resetPasswordSelf = async (body) => {
    return await ApiRequest.set(`v1/user/reset-password`, "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/user/profile/${id}`, "PUT", body);
  }

  static editSelf = async (body) => {
    return await ApiRequest.set(`v1/user/profile`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/user/${id}`, "DELETE");
  }
}
