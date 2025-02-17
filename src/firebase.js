import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnrq2HhMRHV_s4fhwJcMaJ5DBFeiaNTX4",
  authDomain: "spoton-3dc26.firebaseapp.com",
  projectId: "spoton-3dc26",
  storageBucket: "spoton-3dc26.firebasestorage.app",
  messagingSenderId: "267078238784",
  appId: "1:267078238784:web:76eb0953940df18e66d5a5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
