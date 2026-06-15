import { getAnalytics, type Analytics } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

export function initFirebase(): void {
  if (app) return;

  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export function getFirebaseAnalytics(): Analytics | null {
  return analytics;
}
