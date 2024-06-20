import ApiRequest from '../utils/ApiRequest';

export default class Schedule {
	static create = async (body) => {
		return await ApiRequest.set('v1/children-accounts', 'POST', body);
	};

	static getByUserId = async (userId) => {
		return await ApiRequest.set(`v1/children-accounts/parent/${userId}`, 'GET');
	};
}
