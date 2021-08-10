const functions = require("firebase-functions");
const admin = require("firebase-admin");

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
