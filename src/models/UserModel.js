import ApiRequest from "../utils/ApiRequest";

export default class User {

  static getAll = async () => {
    return await ApiRequest.set("v1/users/complete", "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/user", "POST", body);
  }

  static edit = async (id, body) => {
    console.log("BODYZ", body)
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

  static getByUsername = async (username) => {
    return await ApiRequest.set(`v1/user/name/${username}`, "GET");
  }

  static getByEmail = async (email) => {
    return await ApiRequest.set(`v1/user/email/${email}`, "GET");
  }

}
