import ApiRequest from "../utils/ApiRequest";

export default class Admin {
  static login = async (username, password) => {
    return await ApiRequest.set('v1/admin/login', "POST", {
      username: username,
      password: password
    });
  }

  static getAll = async () => {
    return await ApiRequest.set("v1/admins", "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/admin", "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/admin/${id}`, "PUT", body);
  }

  static getById = async (id, body) => {
    return await ApiRequest.set(`v1/admin/${id}`, "GET", body);
  }

  static edit_password = async (id, body) => {
    return await ApiRequest.set(`v1/admin/${id}/password_reset`, "PATCH", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/admin/${id}`, "DELETE");
  }

  // static delete = async (id) => {
  //   return await ApiRequest.set(`v1/admin/${id}`, "DELETE");
  // }

}
