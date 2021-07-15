const axios = require("axios");
const cheerio = require("cheerio");
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
  })
  .catch((err) => {
    console.log(err);
  });
