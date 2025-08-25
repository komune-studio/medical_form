import ApiRequest from "../utils/ApiRequest";

export default class Ilustrator {

  static getAll = async () => {
    return await ApiRequest.set("/v1/illustrators/getall", "GET");
  }

  static getById = async (id) => {
    return await ApiRequest.set(`/v1/illustrators/getbyid/${id}`, "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("/v1/illustrators/create", "POST", body);
  }

  static edit = async (id, body) => {
    console.log("Body: ", body)
    return await ApiRequest.set(`/v1/illustrators/update/${id}`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/illustrators/${id}`, "DELETE");
  }

}
