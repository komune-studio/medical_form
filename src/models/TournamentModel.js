import ApiRequest from "utils/ApiRequest";

export default class TournamentModel {
    static create = async (body) => {
        return await ApiRequest.set("v1/tournament", "POST", body);
    };

    static createDetail = async (params) => {
        return await ApiRequest.set(`v1/tournament/${params.id}`, "POST", params.body);
    };
}
