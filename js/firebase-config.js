// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBLN0tDCLOciir5FgcmUuhTWfJbK6_xqFk",
  authDomain: "prefectsqr.firebaseapp.com",
  projectId: "prefectsqr",
  storageBucket: "prefectsqr.firebasestorage.app",
  messagingSenderId: "157605240235",
  appId: "1:157605240235:web:0d2770b9a65669969006ee"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();