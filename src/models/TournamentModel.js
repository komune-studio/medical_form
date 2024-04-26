import ApiRequest from "utils/ApiRequest";

export default class TournamentModel {
    static create = async (body) => {
        return await ApiRequest.set("v1/tournament", "POST", body);
    };

    static createDetail = async (params) => {
        return await ApiRequest.set(`v1/tournament/${params.id}`, "POST", params.body);
    };

    static getAll = async () => {
        return await ApiRequest.set('v1/tournaments/all', 'GET');
    }

    static getById = async (id) => {
        return await ApiRequest.set(`v1/tournament/${id}`, 'GET');
    }

    static edit = async (params) => {
        return await ApiRequest.set(`v1/tournament/${params.id}`, 'PUT', params.body);
    }
}
