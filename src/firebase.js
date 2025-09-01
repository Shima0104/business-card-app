import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFShKtIH8hKw-SXwIp-LlEZEsrYaWhAjU",
  authDomain: "business-card-app-c01d8.firebaseapp.com",
  projectId: "business-card-app-c01d8",
  storageBucket: "business-card-app-c01d8.firebasestorage.app",
  messagingSenderId: "875047669215",
  appId: "1:875047669215:web:54f72251cab57c6306886a",
  measurementId: "G-LVMH43VH19"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
  db, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
};
