import ApiRequest from "../utils/ApiRequest";

export default class Admin {
  static login = async (username, password) => {
    return await ApiRequest.set('v1/user/login', "POST", {
      username: username,
      password: password
    });
  }
}
