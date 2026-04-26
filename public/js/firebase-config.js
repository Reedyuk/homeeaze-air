/**
 * Firebase Configuration
 *
 * 1. Go to: https://console.firebase.google.com
 * 2. Open your project → Project Settings → Your Apps → Web App
 * 3. Copy your firebaseConfig values and paste them below
 * 4. Replace YOUR_PROJECT_ID in .firebaserc with your actual project ID
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDI2ho6ZXluLVFH9ov22jaFr1gF4Dz1lmU",
  authDomain: "homeeaze-air.firebaseapp.com",
  projectId: "homeeaze-air",
  storageBucket: "homeeaze-air.firebasestorage.app",
  messagingSenderId: "1066096238420",
  appId: "1:1066096238420:web:6b2239c18d7a9e0486f2c1",
  measurementId: "G-K5WJ5JF127"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const sessionId = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));

export async function trackEvent(type, value = null) {
  try {
    await addDoc(collection(db, 'events'), {
      type,
      value,
      sessionId,
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Tracking is best-effort — never block the user
  }
}

export { collection, addDoc, serverTimestamp };
