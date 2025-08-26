import ApiRequest from "utils/ApiRequest"

export default class Author {
  static getAll = async () => {
    return await ApiRequest.set("v1/authors/getall-authors", "GET")
  }

  static getById = async (id) => {
    return await ApiRequest.set(`v1/authors/getbyid/${id}`, "GET")
  }

  static create = async (body) => {
    return await ApiRequest.set("v1/authors/create-authors", "POST", body)
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/authors/update-authors-byid/${id}`, "PUT", body)
  }
}