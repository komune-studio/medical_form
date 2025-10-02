import ApiRequest from "../utils/ApiRequest";

export default class Grant {
  static getAll = async () => {
    return await ApiRequest.set("v1/grants/get-all", "GET");
  }

  static approveGrant = async (id) => {
    return await ApiRequest.set(`v1/grants/approve-grant-by-id/${id}`, "PUT");
  }

  static rejectGrant = async (id) => {
    return await ApiRequest.set(`v1/grants/reject-grant-by-id/${id}`, "PUT");
  }

  static edit = async (id, body) => {
    return await ApiRequest.set(`v1/user/profile/${id}`, "PUT", body);
  }

  static delete = async (id) => {
    return await ApiRequest.set(`v1/user/${id}`, "DELETE");
  }
}
