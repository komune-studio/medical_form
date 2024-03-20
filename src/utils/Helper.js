export default class Helper{
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

}