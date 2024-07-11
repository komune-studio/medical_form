import _ from 'lodash';
import Helper from 'utils/Helper';

export function arraySum(data, accumulatorFunction) {
    if (!data || data.length <= 0) {
        return 0;
    } 

    let result = 0;
    result = data.reduce(accumulatorFunction, result)

    return result
}

export function calculateTrends({filteredData, keys, groupingKeyExtractor, accumulatorFunction, period}) {
	let keysV2 = [];
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
			break;
	}

    const groupedData = _.groupBy(filteredData, groupingKeyExtractor);
    for (let key of keys) {
        if (groupedData[key]) result[key] =  arraySum(groupedData[key], accumulatorFunction)
        else result[key] = 0
    }

    return result;
}

