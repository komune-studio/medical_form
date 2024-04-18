import ApiRequest from "../utils/ApiRequest";

export default class LoyaltyHistoryModel {
    static async getAll() {
        return await ApiRequest.set("v1/loyalty/usage/all", "GET")
    }
}