var fs = require('fs');

const doctors = JSON.parse(fs.readFileSync('./data/doctors_with_reviews.json', 'utf-8'));
const number_of_doctors = doctors.length
const doctors_with_reviews = doctors.filter((doc) => doc.feedback);
const total_reviews = doctors_with_reviews.reduce(
						(total, doctor) => (total + doctor.feedback.all_reviews.length)
					, 0)
stats = doctors_with_reviews.reduce((stats, doc) => {
	number_of_reviews = doc.feedback.all_reviews.length;
	start_range = (parseInt(number_of_reviews/100));
	end_range = start_range + 1;
	range_name = (start_range*100) + "-" + (end_range*100);
	stats[range_name] = stats[range_name] || 0;
	stats[range_name]++;
	return stats;
},{})

console.log("*****************************************************")
console.log("Data fetched for " + number_of_doctors + " Doctors.")
console.log("No reviews for " + (number_of_doctors - doctors_with_reviews.length) + " Doctors.")
console.log("Total " + total_reviews + " found for " + doctors_with_reviews.length + " Doctors.")
console.log("stats about Reviews. How many doctors having reviews in what range")
console.log(stats)
console.log("*****************************************************")