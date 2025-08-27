import ApiRequest from "utils/ApiRequest"

export default class News {
  static getAll = async () => {
    return await ApiRequest.set("v1/news/getallnews", "GET")
  }

  static getById = async (id) => {
    return await ApiRequest.set(`v1/news/getbyid/${id}`, "GET")
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/news/create", "POST", body)
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/news/update/${id}`, "PUT", body)
  }
}