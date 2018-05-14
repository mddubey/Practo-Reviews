const Nightmare = require('nightmare')
const vo = require('vo');
const fs = require('fs');
const nightmare = Nightmare({
	show: false
})

function writeToFile(file, data) {
	fs.writeFile(file, data, (err) => {
		if (err) {
			console.log("error while writing to file", err);
		}
	})
}

var current_page = 0;
const max_pages = 10;
var next_exists = true;
var results = [];

vo(fetchDoctorsDetail)(function(err, result) {
	if (err) {
		console.dir(results.length);
		console.log(current_page);
		writeToFile('./doctors-with-error.json', JSON.stringify(results));
		throw err;
	}else{
		console.log(result)
	};
});

nightmare.on('console', console.log.bind(console));

function* fetchDoctorsDetail() {
	yield nightmare
		.goto('https://www.practo.com/bangalore/doctors')
		.wait('.c-paginator')
		.evaluate(() => {
			const results_selector = "[data-qa-id='results_count']";
			result_count = document.querySelectorAll("[data-qa-id='results_count']")[0].textContent
			console.log("Total " + result_count + " Search Results.");
		})

	has_next_page = yield nightmare.visible(".c-paginator li [data-qa-id='pagination_next']")

	while (has_next_page /*&& current_page < max_pages*/) {
		current_page++;
		results = results.concat(yield nightmare.evaluate((current_page) => {
			const extract_attr = function(elem, attr, elemFor) {
				return elem && elem[attr] || elemFor + " Not Found";
			}

			const cards_q_selector = "[data-qa-id^='doctor_card_']";
			const name_q_selector = "[data-qa-id='doctor_name']";
			const qualification_q_selector = "[data-qa-id='doctor_qualification']";
			const experience_q_selector = "[data-qa-id='doctor_experience']";
			const clinic_q_selector = "[data-qa-id='doctor_clinic_name']";
			const feedback_q_selector = "[data-qa-id='total_feedback']";
			const location_q_selector = "[data-qa-id='practice_locality']";
			const fee_q_selector = "[data-qa-id='consultation_fee']";

			const cards = Array.from(document.querySelectorAll(cards_q_selector));
			console.log("Fetching " + cards.length + " cards from page "+current_page);
			const allDetails = cards.map(function(card) {
				const details = {};
				details['name'] = extract_attr(card.querySelector(name_q_selector), 'textContent', 'Name');
				details['qualification'] = extract_attr(card.querySelector(qualification_q_selector), 'textContent', 'Qualification');
				details['experience'] = extract_attr(card.querySelector(experience_q_selector), 'textContent', 'Experience');
				details['clinic'] = extract_attr(card.querySelector(clinic_q_selector), 'textContent', 'Clinic');
				feedbackEle = card.querySelector(feedback_q_selector)
				details['feedback'] = feedbackEle && {
					total: feedbackEle.textContent,
					url: feedbackEle.href
				}
				details['location'] = extract_attr(card.querySelector(location_q_selector), 'textContent', 'Location');
				details['fee'] = extract_attr(card.querySelector(fee_q_selector), 'textContent', 'Fees');
				return details;
			});
			return allDetails;
		}, current_page));
		yield nightmare
			.click(".c-paginator li [data-qa-id='pagination_next']")
			.wait('body')
		has_next_page = yield nightmare.visible(".c-paginator li [data-qa-id='pagination_next']")
	}
	console.dir(results.length);
	console.log(current_page);
	writeToFile('./doctors.json', JSON.stringify(results));
	yield nightmare.end();
}