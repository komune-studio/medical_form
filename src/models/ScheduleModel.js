import ApiRequest from "../utils/ApiRequest";

export default class Schedule {
    static create = async (body) => {
        return await ApiRequest.set('v1/schedules', 'POST', body)
    }

    static registerDriver = async (body) => {
        return await ApiRequest.set(`v1/schedule/${body.schedule_slot_id}`, 'POST', body)
    }

    static getAllThisWeek = async () => {
        return await ApiRequest.set('v1/schedules/this-week', 'GET');
    }

    static getById = async (id) => {
        return await ApiRequest.set(`v1/schedule/${id}`, 'GET');
    }
}