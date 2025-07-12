// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOYAQ26C8j1OSgWHAp99TQdVcvE0kEGP4",
  authDomain: "skillswapplatform-d26db.firebaseapp.com",
  projectId: "skillswapplatform-d26db",
  storageBucket: "skillswapplatform-d26db.appspot.com",
  messagingSenderId: "666117436402",
  appId: "1:666117436402:web:f5e7a11dbfe9300775716b",
  measurementId: "G-758ZLYH2ZL"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const analytics = getAnalytics(app);
