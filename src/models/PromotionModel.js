import ApiRequest from "../utils/ApiRequest";

export default class PromotionModel {
    static getAll = async () => {
        return await ApiRequest.set("v1/promos", "GET");
    }

    static create = async (body) => {
        return await ApiRequest.set("v1/promo", "POST", body);
    }

    static edit = async (id, body) => {
        return await ApiRequest.set(`v1/promo/${id}`, "PUT", body);
    }

    static getById = async (id, body) => {
        return await ApiRequest.set(`v1/promo/${id}`, "GET", body);
    }

    static delete = async (id) => {
        return await ApiRequest.set(`v1/promo/${id}`, "DELETE");
    }

    static restore = async (id) => {
        return await ApiRequest.set(`v1/referral/${id}`, "PATCH");
    }

}
