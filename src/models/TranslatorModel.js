import ApiRequest from "../utils/ApiRequest";

export default class Translator {

  static getAll = async () => {
    return await ApiRequest.set("/v1/translators/getall", "GET");
  }

  static getById = async (id) => {
    return await ApiRequest.set(`/v1/translators/getbyid/${id}`, "GET");
  }

  static create = async (body) => {
    return await ApiRequest.set("/v1/translators/create", "POST", body);
  }

  static edit = async (id, body) => {
    console.log("Body: ", body)
    return await ApiRequest.set(`/v1/translators/update/${id}`, "PUT", body);
  }

  // static delete = async (id) => {
  //   return await ApiRequest.set(`v1/user/${id}`, "DELETE");
  // }

}
