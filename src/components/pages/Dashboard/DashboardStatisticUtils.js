import _ from 'lodash';
import Helper from 'utils/Helper';

export function arraySum(data, accumulatorFunction) {
	if (!data || data.length <= 0) {
		return 0;
	}

	let result = 0;
	result = data.reduce(accumulatorFunction, result);

	return result;
}

export function calculateTrends({ filteredData, groupingKeyExtractor, accumulatorFunction, period }) {
	/*
        NOTE: key format used in groupingKeyExtractor MUST match with key format that used in this function
        -> period === 'daily' ? 'HH', e.g.: '10'
        -> period === 'weekly' ? 'dddd', e.g.: 'Sunday'
        -> period === 'monthly' ? Week Number, e.g: 20
    */

	let keys = [];
	let result = {};

	switch (period) {
		case 'monthly':
			keys = Helper.getWeeksOfCurrentMonth();
			break;
		case 'weekly':
			keys = Helper.getDaysOfWeek();
			break;
		case 'daily':
		default:
			keys = Helper.getOperationalHours();
	}

	const groupedData = _.groupBy(filteredData, groupingKeyExtractor);
	for (let key of keys) {
		if (groupedData[key]) result[key] = arraySum(groupedData[key], accumulatorFunction);
		else result[key] = 0;
	}

	return result;
}

export function calculateHeatMap({
	filteredData,
	outerGroupingKeyExtractor,
	innerGroupingKeyExtractor,
	accumulatorFunction,
	period,
}) {
	let result = [];
	let innerKeys = [];
	let outerKeys = [];

	if (period === 'monthly') {
		outerKeys = Helper.getWeeksOfCurrentMonth();
		innerKeys = Helper.getDaysOfWeek();
	} else {
		outerKeys = Helper.getDaysOfWeek();
		innerKeys = Helper.getOperationalHours();
	}

	let outerGroup = _.groupBy(filteredData, outerGroupingKeyExtractor);
	for (let outerKey of outerKeys) {
		let innerArray = [];
		let innerGroup = _.groupBy(outerGroup[outerKey], innerGroupingKeyExtractor);
		for (let innerKey of innerKeys) {
			if (!innerGroup[innerKey]) {
				innerArray.push(0);
				continue;
			}
			innerArray.push(arraySum(innerGroup[innerKey], accumulatorFunction));
		}
		result.push(innerArray);
	}

	return {outerKeys, innerKeys, result};
}
