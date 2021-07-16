const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

let page = "https://animecorner.me/winter-2021-anime-rankings-week-01/"; // Change me

axios
  .get(page)
  .then((res) => {
    let $ = cheerio.load(res.data);

    let rankings = [];

    // Select list and iterate through each list item, splitting the list text and adding them to the ranking array with their corresponding key value
    $("div.tt-content ul li").each((li_index, li) => {
      rankings[li_index] = {
        rank: li_index + 1,
        title: $(li)
          .text()
          .substring(
            $(li).text().indexOf(":") + 3,
            $(li).text().indexOf("–") - 2
          ),
        votes: parseFloat(
          $(li)
            .text()
            .substring($(li).text().indexOf("–") + 2, $(li).text().indexOf("%"))
        ),
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
    console.log($("h1.text-left").text() + " successfully written to database");
  })
  .catch((err) => {
    console.error("Error fetching page: ", err);
  });
