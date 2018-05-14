# Practo-Reviews
Nightmare scripts to fetch doctor reviews in Bangalore.

### Prerequisites
* Node
* NPM

### How To RUN
- Clone the repo.
- Install dependencies:-
- Run the script to fetch all the doctor details. This will take about 15-20 mins. It will fetch all the reviews and store in `doctors.json`.
- Run the script to fetch all the reviews. This will be very time consuming. On my mac it took about 7 hours. There is a scope for a lot of improvements in this script.
- Run the stats script.

```
npm install nightmare vo
node practo-doctors.js
node practo_doctors_with_reviews.js
node practo-data-stats.js
```
