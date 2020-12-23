// These can be used by both the back and frontend

function initializeEmptyCanvas(year) {
	const firstDay = new Date(year, 0, 1);
	const lastDay = new Date(year, 11, 31);
	let currentDay = firstDay;
	const data = [];
	while(currentDay.getTime() <= lastDay) {
		data.push(0);
		currentDay.setDate(currentDay.getDate() + 1);
	}
	return data;
}

// Get the sunday of the week containing the start of a year
function firstWeekSunday(year) {
	let currentDay = new Date(year, 0, 1); // Get Jan 1st of the year as a start point
	while(currentDay.getDay() != 0) // until we're on a sunday
		currentDay.setDate(currentDay.getDate() - 1); // walk backwards towards the previous day
	return currentDay;
}
function yearStartOffset(year) { // How many days since the start of the year until the year starts
	const sunday = firstWeekSunday(year);
	const beginningOfYear = new Date(year, 0, 1).getTime();
	let offset = 0;
	while(sunday.getTime() < beginningOfYear) {
		sunday.setDate(sunday.getDate() + 1);
		offset++;
	}
	return offset;
}
module.exports = {initializeEmptyCanvas, firstWeekSunday, yearStartOffset};