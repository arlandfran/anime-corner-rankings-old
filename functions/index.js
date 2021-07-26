const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.fetchSubCollections = functions.https.onCall(async (data, context) => {
  const subCollectionsArray = await db
      .collection("2021")
      .doc("Spring")
      .listCollections();
  const subCollections = subCollectionsArray.map((col) => col.id);
  return subCollections;
});
