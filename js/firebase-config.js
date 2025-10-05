// js/firebase-config.js

// Import Firebase modules properly
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLN0tDCLOciir5FgcmUuhTWfJbK6_xqFk",
  authDomain: "prefectsqr.firebaseapp.com",
  projectId: "prefectsqr",
  storageBucket: "prefectsqr.firebasestorage.app",
  messagingSenderId: "157605240235",
  appId: "1:157605240235:web:0d2770b9a65669969006ee"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Make them globally available
window.db = db;
window.auth = auth;
