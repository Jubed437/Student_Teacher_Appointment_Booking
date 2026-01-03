import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAUPSCb9WcWu-A3q9XtbVGJWTxxkf7WAJg",
    authDomain: "student-teacher-appointm-74f9a.firebaseapp.com",
    projectId: "student-teacher-appointm-74f9a",
    storageBucket: "student-teacher-appointm-74f9a.firebasestorage.app",
    messagingSenderId: "567384703334",
    appId: "1:567384703334:web:ee3604efa8709947d388a7",
    measurementId: "G-H4HKQST4D7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
