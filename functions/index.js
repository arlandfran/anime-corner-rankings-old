const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const db = admin.firestore();

exports.fetchSubCollections = functions.https.onCall(async (data) => {
  const subCollectionsArray = await db
    .collection(data.year)
    .doc(data.season)
    .listCollections();
  const subCollections = subCollectionsArray.map((col) => col.id);
  return subCollections;
});

exports.fetchAnime = functions.https.onCall(async (data) => {
  console.log(data.title);
  const query = `
  query ($title: String){
    Media (search: $title, type: ANIME) {
      rankings {
        allTime
        rank
        context
      }
      genres
      description
      externalLinks {
        url
      }
      coverImage {
        extraLarge
      }
    }
  } 
  `;

  const variables = {
    title: data.title,
  };

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const result = await axios({
    method: "post",
    url: "https://graphql.anilist.co/",
    headers,
    data: JSON.stringify({
      query: query,
      variables: variables,
    }),
  }).catch((err) => console.log(err.message));

  return result.data.data.Media;
});
