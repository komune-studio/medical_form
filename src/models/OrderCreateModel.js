import ApiRequest from "../utils/ApiRequest";

export default class OrderCreateModel {
    static getAll = async () => {
        return await ApiRequest.set("v1/barcoin/item/all", "GET");
    }
}