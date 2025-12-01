// SECURE FIREBASE CONFIGURATION
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];
// Validate environment variables
if (typeof window !== 'undefined') { // Client-side validation for public vars
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Initialize Firebase services
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Use emulators if running in development mode
if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR === 'true') {
    try {
        connectAuthEmulator(auth, "http://localhost:9099");
        // connectFirestoreEmulator(db, 'localhost', 8080);
        // connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
        console.warn("Firebase emulators might not be running. Skipping connection.", error);
    }
}

export { app, db, rtdb, auth, storage };
// Utility functions
export const FirebaseUtils = {
  enableNetwork: async () => {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.warn('Failed to enable network:', error);
    }
  },
  
  disableNetwork: async () => {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.warn('Failed to disable network:', error);
    }
  },
  
  isInitialized: () => {
    return !!getApp() && !!db && !!auth;
  },
};
