import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB330pmJkgFDz6_tdPczqdVL4NlR5ryApU",
  authDomain: "e-module-konseling.firebaseapp.com",
  projectId: "e-module-konseling",
  storageBucket: "e-module-konseling.firebasestorage.app",
  messagingSenderId: "887311935652",
  appId: "1:887311935652:web:8fa4a7a99e58b7c3bb1e31",
  measurementId: "G-P7Z2D9SK8N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);