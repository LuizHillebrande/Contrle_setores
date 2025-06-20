import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALziCMD2MqJFcdslLDLmccmqexulhNXsI",
  authDomain: "controle-setor.firebaseapp.com",
  projectId: "controle-setor",
  storageBucket: "controle-setor.firebasestorage.app",
  messagingSenderId: "347323620977",
  appId: "1:347323620977:web:962116580f3565351585d0",
  measurementId: "G-P5GC8DSMRT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 