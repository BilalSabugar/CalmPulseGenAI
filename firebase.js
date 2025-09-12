import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqrmQm6zlc_0UeDEz_ss-q79iieH5hSXY",
  authDomain: "booksanta-72c67.firebaseapp.com",
  projectId: "booksanta-72c67",
  storageBucket: "booksanta-72c67.appspot.com",
  messagingSenderId: "160318096694",
  appId: "1:160318096694:web:545116dc08965229ee1f97"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

export default db;