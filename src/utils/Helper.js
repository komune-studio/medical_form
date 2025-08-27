import moment from 'moment';
import Constant from './Constant';

export default class Helper {
	static phoneRegEx = /^(?:([+]\d{1,4})[-.\s]){1}\d+$/

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

		while (start.isBefore(end)) {
			operationalHours.push(start.format('HH'));
			start.add(1, 'hours');
		}

		return operationalHours;
	}

	static getDaysOfWeek() {
		const start = moment().startOf('isoWeek');
		const end = moment().endOf('isoWeek');
		const daysOfWeek = []

		while (start.isSameOrBefore(end)) {
			daysOfWeek.push(start.format('dddd'));
			start.add(1, 'days');
		}

		return daysOfWeek;
	}

	static getWeeksOfCurrentMonth() {
		const currentMonth = moment().month();
		const currentYear= moment().year()
		const start = moment().startOf('month');
		console.log(start.startOf('isoWeek').format("DD MMM YYYY"))
		const weeksOfCurrentMonth = [];

		while (start.month() <= currentMonth && start.year() <= currentYear ) {
			console.log("CHECKING " + start.month())
			console.log(weeksOfCurrentMonth)
			weeksOfCurrentMonth.push(`${start.format("DD MMM")}`)
			start.add(1, 'weeks');
		}

		return weeksOfCurrentMonth;
	}
}
