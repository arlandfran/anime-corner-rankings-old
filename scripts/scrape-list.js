const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

let page;

for (let i = 0; i < 13; i++) {
  if (i < 10) {
    page = `https://animecorner.me/winter-2021-anime-rankings-week-0${i.toString()}/`;
  } else {
    page = `https://animecorner.me/winter-2021-anime-rankings-week-${i.toString()}/`;
  }
  console.log(page);
}
