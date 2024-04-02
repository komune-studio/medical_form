import ApiRequest from "../utils/ApiRequest";

export default class OrderModel {
    static getAll = async () => {
        return await ApiRequest.set("v1/barcoin/usage/all", "GET");
    }
}