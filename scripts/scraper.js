const axios = require("axios");
const cheerio = require("cheerio");
const { data } = require("cheerio/lib/api/attributes");
const { first } = require("cheerio/lib/api/traversing");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const baseURL =
  "https://animecorner.me/category/anime-corner/rankings/anime-of-the-week/";

axios
  .get(baseURL)
  .then((res) => {
    let $ = cheerio.load(res.data);

    // Get latest ranking page url which contains our table data
    let page = $(".post-grid-view")
      .children()
      .first()
      .children()
      .first()
      .children()
      .first()
      .attr("href");

    axios
      .get(page)
      .then((res) => {
        $ = cheerio.load(res.data);

        let rankings = [];

        // Select tbody element and iterate through each tr element to push each cell to data array
        $("tbody tr").each((tr_index, tr) => {
          rankings[tr_index] = {
            rank: $(tr).children().first().text(),
            title: $(tr).children().first().next().text(),
            votes: $(tr).children().last().text(),
          };
        });

        let data = {};
        let title = $("h1.text-left").text().split(" "); // Expected format: {season} {year} Top Anime Rankings – Week {period}

        data.year = title[1];
        data.season = title[0];
        data.period = "week-" + title.pop();
        data.rankings = rankings;

        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
