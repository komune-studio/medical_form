import ApiRequest from "../utils/ApiRequest";

export default class Publisher {
  static getAll = async () => {
    return await ApiRequest.set("v1/publishers", "GET");
  }

  static getById = async (id) => {
    return await ApiRequest.set(`v1/publisher/${id}`, "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/publisher", "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/publisher/${id}`, "PUT", body);
  }

  static delete = async (id, body) => {
    return await ApiRequest.set(`v1/publisher/${id}`, "DELETE", body);
  }
}
