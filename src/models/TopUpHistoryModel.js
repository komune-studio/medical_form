import ApiRequest from "../utils/ApiRequest";

export default class TopUpHistoryModel {
    static getAll = async () => {
        return await ApiRequest.set("v1/top-up-histories", "GET");
    }
}