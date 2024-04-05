import ApiRequest from "../utils/ApiRequest";

export default class User {
  static login = async (username, password) => {
    return await ApiRequest.set('v1/user/login', "POST", {
      username: username,
      password: password
    });
  }

  static getAll = async () => {
    return await ApiRequest.set("v1/users", "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/user", "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/user/${id}`, "PUT", body);
  }

  static getById = async (id, body) => {
    return await ApiRequest.set(`v1/user/${id}`, "GET", body);
  }

   static edit_password = async (id, body) => {
    return await ApiRequest.set(`v1/user/${id}/password_reset`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/user/${id}`, "DELETE");
  }
}
