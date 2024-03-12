import apiConfig from "./ApiConfig";

export default class ApiRequest {
  static set = async (endpoint, method, body) => {

    let token = localStorage.getItem('super_token') || localStorage.getItem('token');
    console.log(body)
    console.log(`API ACCESS [${method}]: ` + endpoint);
    let request = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : null,
        Accept: 'application/json',
      },
      body: JSON.stringify(body)
      // body: "afdadsf"
    };

    let response = await fetch(apiConfig.base_url + endpoint, request);

    if (response.ok) {
      return response.json();
    }

    let error = await response.json();
    console.log(error)
    console.log(error.code)

    if (error.code === 'JWT_EXPIRED' || error.code === 'NO_TOKEN_PROVIDED' || error.code === 'INVALID_TOKEN' || error.code === 'BAD_TOKEN_FORMAT' || error.code === 'NO_SECRET_DEFINED' || error.code === 'JWT_MALFORMED' || error.code === 'JWT_MALFORMED' || error.code === 'JWT_EXPIRED' || error.code === "SUBSCRIPTION_EXPIRED") {

      localStorage.removeItem("super_token")
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("role")

      sessionStorage.removeItem("super_token")
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("username")
      sessionStorage.removeItem("role")

      window.location = "/login"
      window.location.reload();
      throw error;
    }


    throw error;
  }

  static setMultipart = async (endpoint, method, body) => {
    console.log('isi body', body)
    let token = localStorage.super_token;

    let response = await fetch(apiConfig.base_url + endpoint, {
      method: method,
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
      },
      body: body
    });
    console.log(response)
    if (response.ok) {
      return response.json()
    }
    else {
      let error = await response.json()
      console.log(error)

      if (error.code === 'JWT_EXPIRED' || error.code === 'NO_TOKEN_PROVIDED' || error.code === 'INVALID_TOKEN' || error.code === 'BAD_TOKEN_FORMAT' || error.code === 'NO_SECRET_DEFINED' || error.code === 'JWT_MALFORMED' || error.code === 'JWT_MALFORMED' || error.code === 'JWT_EXPIRED' || error.code === "SUBSCRIPTION_EXPIRED") {

        localStorage.removeItem("super_token")
        localStorage.removeItem("username")
        localStorage.removeItem("token")
        localStorage.removeItem("role")

        sessionStorage.removeItem("super_token")
        sessionStorage.removeItem("username")
        sessionStorage.removeItem("role")
        sessionStorage.removeItem("token")

        window.location = "/login"
        window.location.reload();
        throw error;
      }

      throw error
    }
  }

}
