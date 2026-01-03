import { db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

async function log(action, userId, details = {}) {
    try {
        await addDoc(collection(db, 'logs'), {
            action: action,
            userId: userId,
            details: details,
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Logging failed:', err);
    }
}

export { log };
