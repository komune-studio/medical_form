import ApiRequest from "../utils/ApiRequest";

export default class Schedule {
    static create = async (body) => {
        return await ApiRequest.set('v1/schedules', 'POST', body)
    }

    static getAllThisWeek = async () => {
        return await ApiRequest.set('v1/schedules/this-week', 'GET');
    }
}