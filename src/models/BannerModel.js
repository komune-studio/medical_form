import ApiRequest from "utils/ApiRequest"

export default class Banner {
  static create = async (body) => {
    return await ApiRequest.set("v1/banners/create", "POST", body); 
  }
  
  static getAll = async () => {
    return await ApiRequest.set("v1/banners/get-all", "GET"); 
  }
  
  static getById = async (id) => {
    return await ApiRequest.set(`v1/banners/get-by-id/${id}`, "GET"); 
  }
  
  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/banners/update-by-id/${id}`, "PUT", body); 
  }
  
  static delete = async (id) => {
    return await ApiRequest.set(`v1/banners/delete-by-id/${id}`, "DELETE"); 
  }
}