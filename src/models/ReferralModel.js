import ApiRequest from "../utils/ApiRequest";

export default class Referral {
    static getAll = async () => {
        return await ApiRequest.set("v1/referrals", "GET");
    }

    static create = async (body) => {
        return await ApiRequest.set("v1/referral", "POST", body);
    }

    static edit = async (id, body) => {
        return await ApiRequest.set(`v1/referral/${id}`, "PUT", body);
    }

    static getById = async (id, body) => {
        return await ApiRequest.set(`v1/referral/${id}`, "GET", body);
    }

    static delete = async (id) => {
        return await ApiRequest.set(`v1/referral/${id}`, "DELETE");
    }

    static restore = async (id) => {
        return await ApiRequest.set(`v1/referral/${id}`, "PATCH");
    }

}
