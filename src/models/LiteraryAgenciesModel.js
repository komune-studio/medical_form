import ApiRequest from "../utils/ApiRequest";

export default class LiteraryAgencies {

  static getAll = async () => {
    return await ApiRequest.set("/v1/literary-agencies/getall", "GET");
  }

  static getById = async (id) => {
    return await ApiRequest.set(`/v1/literary-agencies/getbyid/${id}`, "GET");
  }

  static getAllWithPagination = async (limit, page, keyword) => {
    return await ApiRequest.set(`v1/literary-agencies/get-with-pagination?page=${page}&limit=${limit}&sort_by=created_at&sort_type=asc&keyword=${keyword}`, "GET")
  }

  static create = async (body) => {
    return await ApiRequest.set("/v1/literary-agencies/create", "POST", body);
  }

  static edit = async (id, body) => {
    console.log("Body: ", body)
    return await ApiRequest.set(`/v1/literary-agencies/update/${id}`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/literary-agencies/${id}`, "DELETE");
  }

}
