import ApiRequest from "utils/ApiRequest"

export default class Category {
  static getAll = async () => {
    return await ApiRequest.set("/v1/categories/getallcategory", "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set(`/v1/categories/create`, "POST", body);
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`/v1/categories/update/${id}`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`/v1/categories/delete/${id}`, "DELETE");
  }
}