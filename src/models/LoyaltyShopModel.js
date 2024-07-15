import ApiRequest from "../utils/ApiRequest";

export default class LoyaltyShopModel {
    static getAll = async () => {
        return await ApiRequest.set("v1/loyalty-shops", "GET");
    }
    static getAllActive = async () => {
        return await ApiRequest.set("/v1/loyalty-shops/active", "GET");
    }

    static create = async (body) => {
        return await ApiRequest.set("v1/loyalty-shop", "POST", body);
    }

    static edit = async (id, body) => {
        return await ApiRequest.set(`v1/loyalty-shop/${id}`, "PUT", body);
    }

    static getById = async (id, body) => {
        return await ApiRequest.set(`v1/loyalty-shop/${id}`, "GET", body);
    }

    static delete = async (id) => {
        return await ApiRequest.set(`v1/loyalty-shop/${id}`, "DELETE");
    }

    static restore = async (id) => {
        return await ApiRequest.set(`v1/loyalty-shop/${id}`, "PATCH");
    }

}
