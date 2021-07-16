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

        // Select tbody element and iterate through each table row to push each table cell to rankings array
        $("tbody tr").each((tr_index, tr) => {
          rankings[tr_index] = {
            rank: parseInt($(tr).children().first().text()),
            title: $(tr).children().first().next().text(),
            votes: parseFloat($(tr).children().last().text()),
          };
        });

        let data = {};
        // Expected format: {season} {year} Top Anime Rankings – Week {period}
        let title = $("h1.text-left").text().split(" ");

        data.year = title[1];
        data.season = title[0];
        data.period = "Week-" + title.pop();
        data.rankings = rankings;

        const doc = db
          .collection(data.year)
          .doc(data.season)
          .collection(data.period);

        for (rank in data.rankings) {
          doc.add(data.rankings[rank]).catch((err) => {
            console.error("Error adding document: ", err);
          });
        }
        console.log(
          $("h1.text-left").text() + " successfully written to database"
        );
      })
      .catch((err) => {
        console.error("Error fetching page: ", err);
      });
  })
  .catch((err) => {
    console.error("Error fetching page: ", err);
  });
