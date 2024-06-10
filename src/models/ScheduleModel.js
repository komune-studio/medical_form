import ApiRequest from "../utils/ApiRequest";

export default class Schedule {
    static create = async (body) => {
        return await ApiRequest.set('v1/schedules', 'POST', body)
    }

    static edit = async (body) => {
        return await ApiRequest.set(`v1/schedule/${body.schedule_slot_id}`, 'PUT', body)
    }

    static registerDriver = async (body) => {
        return await ApiRequest.set(`v1/schedule/${body.schedule_slot_id}`, 'POST', body)
    }

    static unregisterDriver = async(scheduleSlotUserId) => {
        return await ApiRequest.set(`v1/schedule/user/${scheduleSlotUserId}`, 'DELETE')
    }

    static getAllThisWeek = async () => {
        return await ApiRequest.set('v1/schedules/this-week', 'GET');
    }

    static getById = async (id) => {
        return await ApiRequest.set(`v1/schedule/${id}`, 'GET');
    }
}