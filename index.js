import speedTest from "speedtest-net";
import firebase from "firebase/app";
import * as Sentry from "@sentry/node";
import "firebase/firestore";
import "dotenv/config";

const calculateSpeed = async () => {
  var response = null;
  try {
    console.log("Calculating...");
    response = await speedTest();
    console.log("Done calculating.");
  } catch (err) {
    console.log("Calculation failed:", err);
    Sentry.captureException(err);
  }
  return response;
};

const uploadSpeed = async (db, speedInfo) => {
  try {
    console.log("Saving speed info...");
    const response = await db.collection("speed").add(speedInfo);
    console.log("Speed info successfully saved");
  } catch (error) {
    console.log("Saving speed info failed:", error);
    Sentry.captureException(error);
  }
};

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_USER_ID,
  SENTRY_DSN,
} = process.env;

var firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

class InternetSpeed {
  constructor() {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 1.0,
    });

    firebase.initializeApp(firebaseConfig);
    this.db = firebase.firestore();
    this.calculateAndUploadSpeed();
  }

  async calculateAndUploadSpeed() {
    const speedInfo = await calculateSpeed();
    if (speedInfo == null) return;

    speedInfo["userid"] = FIREBASE_USER_ID;
    uploadSpeed(this.db, speedInfo);
  }
}

new InternetSpeed();
