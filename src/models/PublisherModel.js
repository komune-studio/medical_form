import ApiRequest from "../utils/ApiRequest";

export default class Publisher {
  static getAll = async () => {
    return await ApiRequest.set("v1/publishers/getall", "GET");
  }

  static getById = async (id) => {
    return await ApiRequest.set(`v1/publishers/getbyid/${id}`, "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/publishers/create", "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/publishers/update/${id}`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/publishers/${id}`, "DELETE");
  }
}
