import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const envoirnment = process.env.REACT_APP_ENVIRONMENT || "DEV";
// console.log({ e: process.env });
const firebaseConfig = {
  apiKey: process.env[`REACT_APP_${envoirnment}_FIREBASE_API_KEY`],
  authDomain: process.env[`REACT_APP_${envoirnment}_FIREBASE_AUTH_DOMAIN`],
  projectId: process.env[`REACT_APP_${envoirnment}_FIREBASE_PROJECT_ID`],
  storageBucket:
    process.env[`REACT_APP_${envoirnment}_FIREBASE_STORAGE_BUCKET`],
  messagingSenderId:
    process.env[`REACT_APP_${envoirnment}_FIREBASE_MESSAGING_SENDER_ID`],
  appId: process.env[`REACT_APP_${envoirnment}_FIREBASE_APP_ID`],
  // measurementId: process.env[`REACT_APP_${envoirnment}_FIREBASE_MEASUREMENT_ID`],
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const auth = app.auth();

const _app = firebase.initializeApp(firebaseConfig, "secondary");
const _auth = _app.auth();
export { db, app, _auth, auth };
