const Nightmare = require('nightmare')
const vo = require('vo');
const fs = require('fs');

const doctors = JSON.parse(fs.readFileSync('./doctors.json', 'utf-8'));
const doctors_with_reviews = [];

function writeToFile(file, data) {
	fs.writeFile(file, data, (err) => {
		if (err) {
			console.log("error while writing to file", err);
		}
	})
}

setInterval(() => {
	console.log("Writing to file in intervals, if it crashes in between")
	const filename = './backups/doctors_with_reviews.json' + new Date().toISOString();
	writeToFile(filename, JSON.stringify(doctors))
}, 5*60*1000)

vo(fetchReviews)(doctors)
	.then(out => console.log(out))
	.catch(e => console.error(e))

function* fetchReviews(doctors) {
	const nightmare = Nightmare({
		show: false
	})
	for (var i = 0; i < doctors.length; i++) {
		const doctor = doctors[i];
		console.log(doctor.name)
		if (!doctor.feedback) {
			console.log("No feedback for "+(i+1));
			continue;
		};
		console.log("Expected Reviews " + doctor.feedback.total + " For " + (i + 1));
		url = doctor.feedback.url;
		yield nightmare.goto(url)
			.wait('body')

		has_more_reviews = yield nightmare.visible("[data-qa-id='view-more-feedback']")
		while (has_more_reviews) {
			yield nightmare
				.click("[data-qa-id='view-more-feedback']")
				.wait(2000)
			has_more_reviews = yield nightmare.visible("[data-qa-id='view-more-feedback']")
		}
		doctor.feedback['all_reviews'] = yield nightmare.evaluate(() => {
			const all_feedback_q_selector = "[data-qa-id='feedback_item']";
			const name_q_selector = "[data-qa-id='reviewer-name']";
			const liked_q_selector = '.u-cushion--bottom-less i';
			reviews = Array.from(document.querySelectorAll(all_feedback_q_selector));
			return reviews.map((review) => {
				const reviewData = {};
				reviewData['reviwer'] = review.querySelector(name_q_selector).textContent;
				reviewData['liked'] = review.querySelector(liked_q_selector)
					.classList.contains('icon-ic_like_filled');
				allFeedbackFields = Array.from(review.querySelectorAll('.feedback__content'));
				reviewData['contents'] = allFeedbackFields.map((feedbackField) => {
					return feedbackField.textContent
				});
				return reviewData;
			})
		})
		console.log("Found " + doctor.feedback['all_reviews'].length + " Reviews");
	};

	// console.log(doctor.feedback['all_reviews']);
	writeToFile('./doctors_with_reviews.json', JSON.stringify(doctors));
	yield nightmare.end()
}