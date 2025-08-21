import ApiRequest from "../utils/ApiRequest";

export default class Admin {
  static login = async (body) => {
    return await ApiRequest.set('v1/user/login', "POST", body);
  }
}
