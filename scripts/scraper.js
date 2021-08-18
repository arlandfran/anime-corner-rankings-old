const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Main script logic
const main = async () => {
  console.log("Start");
  const page = await getRankingsPage();
  let data = await scrapePage(page);
  await writeDataToFirestore(data);
  console.log("Done");
};

// Returns latest ranking url anime-of-the-week post list
const getRankingsPage = async () => {
  const baseURL =
    "https://animecorner.me/category/anime-corner/rankings/anime-of-the-week/";

  // Get page that contains the latest rankings
  const page = await axios({
    method: "get",
    url: baseURL,
  })
    .then((res) => {
      let $ = cheerio.load(res.data);

      // Get latest ranking page url which contains our table data
      let page = $(".penci-wrapper-data")
        .children()
        .first()
        .children()
        .first()
        .children()
        .last()
        .children()
        .first()
        .find("h2")
        .find("a")
        .attr("href");

      return page;
    })
    .catch((err) =>
      console.log(`Axios: Error fetching ${baseUrl}:`, err.message)
    );
  return page;
};

// Scrapes table, parses data and returns data object
const scrapePage = async (page) => {
  console.log(`Scraping ${page}...`);
  let data = await axios({
    method: "get",
    url: page,
  })
    .then((res) => {
      let $ = cheerio.load(res.data);

      let data;
      let rankings = [];

      // Expected format: {season} {year} Top Anime Rankings – Week {week}
      let title = $("h1.post-title").text().split(" ");

      // Select tbody element and iterate through each table row to push each table cell to rankings array
      $("tbody tr").each((tr_index, tr) => {
        rankings[tr_index] = {
          rank: parseInt($(tr).children().first().text()),
          title: $(tr).children().first().next().text(),
          votes: parseFloat($(tr).children().last().text()),
        };
      });

      data = {
        year: title[1],
        season: title[0],
        week: "Week-" + title.pop(),
        rankings: rankings,
      };

      return data;
    })
    .catch((err) => console.log(`Axios: Error fetching ${page}`, err.message));
  return data;
};

// Takes data object as argument and writes to firestore
const writeDataToFirestore = async (data) => {
  console.log("Writing to firestore...");
  const doc = db.collection(data.year).doc(data.season).collection(data.week);

  for (anime in data.rankings) {
    await doc
      .add(data.rankings[anime])
      .catch((err) => console.log("Error adding document: ", err));
    console.log(`${data.rankings[anime].title} added`);
  }

  console.log(
    `${data.year} ${data.season} Top Anime Rankings - ${data.week} successfully added to database`
  );
};

// Execute main script
main();
