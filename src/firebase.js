import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAq59lK80pPZj_-DmD8swIckq2TYTt8Meo", // Safe to expose - ref: https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
  authDomain: "anime-corner-rankings.firebaseapp.com",
  projectId: "anime-corner-rankings",
  storageBucket: "anime-corner-rankings.appspot.com",
  messagingSenderId: "1056575402361",
  appId: "1:1056575402361:web:0fd9790f5ef43a94897fa8",
  measurementId: "G-264NJGB06X",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const cf = firebase.functions();
