import { getApps, getApp, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 1. الإعدادات الصحيحة (شاملة databaseURL)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAzmZ4p8Rpx8kusWuP3v8PnQyc0Ao_cU7Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-7831135066-b7ebf.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://studio-7831135066-b7ebf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-7831135066-b7ebf",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-7831135066-b7ebf.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "427859065555",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:427859065555:web:3d0519e8804380fa4e3226",
};

// 2. تهيئة التطبيق (تجنب التكرار)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. تهيئة Firestore مع إعدادات خاصة لبيئة IDX (الحل لمشكلة Error 400)
// نستخدم initializeFirestore بدلاً من getFirestore لتفعيل experimentalForceLongPolling
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // ✅ هذا السطر يحل مشكلة الاتصال في بيئات التطوير
});

const rtdb = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// طباعة للتحقق (اختياري)
console.log("Firebase Initialized with Project ID:", firebaseConfig.projectId);

export { app, db, rtdb, auth, storage };