import ApiRequest from "../utils/ApiRequest";

export default class User {
    static getAll = async () => {
        return await ApiRequest.set("v1/notification-histories", "GET");
    }

    static create = async (body) => {
        return await ApiRequest.set("v1/notification-history", "POST", body);
    }

    static edit = async (id, body) => {
        return await ApiRequest.set(`v1/notification-history/${id}`, "PUT", body);
    }

    static getById = async (id, body) => {
        return await ApiRequest.set(`v1/notification-history/${id}`, "GET", body);
    }


    static delete = async (id) => {
        return await ApiRequest.set(`v1/notification-history/${id}`, "DELETE");
    }

}
