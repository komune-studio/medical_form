import moment from 'moment';
import Constant from './Constant';

export default class Helper {
	static formatNumber(number) {
		// Convert number to string
		let strNumber = number.toString();

		// Split the number into integer and decimal parts (if any)
		let parts = strNumber.split('.');

		// Regular expression to match digits in groups of three from the end
		let regExp = /\B(?=(\d{3})+(?!\d))/g;

		// Add separators for thousands
		parts[0] = parts[0].replace(regExp, ',');

		// Join integer and decimal parts (if any)
		return parts.join('.');
	}

	static toTitleCase(str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	static isValidEmail(str) {
		const emailRegEx =
			/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		return emailRegEx.test(str);
	}

	static getOperationalHours() {
		const start = moment().set({
			hour: Constant.OPERATIONAL_HOURS_START.hour,
			minute: Constant.OPERATIONAL_HOURS_START.minute,
			second: Constant.OPERATIONAL_HOURS_START.second,
		});

		const end = moment().set({
			hour: Constant.OPERATIONAL_HOURS_END.hour,
			minute: Constant.OPERATIONAL_HOURS_END.minute,
			second: Constant.OPERATIONAL_HOURS_END.second,
		});
		const operationalHours = [];

		while (start.isSameOrBefore(end)) {
			operationalHours.push(start.format('HH'));
			start.add(1, 'hours');
		}

		return operationalHours;
	}

	static getDaysOfWeek() {
		const start = moment().day(0).set({ hour: 0, minute: 0, second: 0 });
		const end = moment().day(6).set({ hour: 23, minute: 59, second: 59 });
		const daysOfWeek = []

		while (start.isSameOrBefore(end)) {
			daysOfWeek.push(start.format('dddd'));
			start.add(1, 'days');
		}

		return daysOfWeek;
	}

	static getWeeksOfCurrentMonth() {
		const currentMonth = moment().month();
		const start = moment().startOf('month').set({hour: 0, minute: 0, second: 0});
		const weeksOfCurrentMonth = [];

		while (start.month() === currentMonth) {
			weeksOfCurrentMonth.push(start.week())
			start.add(1, 'weeks');
		}

		return weeksOfCurrentMonth;
	}
}
