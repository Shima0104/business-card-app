// 1. Firebaseから、必要な「すべての」機能をインポートする
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  setDoc,     // ★ 更新の神を召喚
  deleteDoc   // ★ 削除の神を召喚
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ★ 認証の神を召喚

// 2. 接続情報
const firebaseConfig = {
  apiKey: "AIzaSyBFShKtIH8hKw-SXwIp-LlEZEsrYaWhAjU",
  authDomain: "business-card-app-c01d8.firebaseapp.com",
  projectId: "business-card-app-c01d8",
  storageBucket: "business-card-app-c01d8.firebasestorage.app",
  messagingSenderId: "875047669215",
  appId: "1:875047669215:web:54f72251cab57c6306886a",
  measurementId: "G-LVMH43VH19"
};

// 3. Firebaseアプリを、初期化
const app = initializeApp(firebaseConfig);

// 4. Firestoreデータベースを、準備
const db = getFirestore(app);


// 5. 「すべての」機能を、他のファイルから、使えるように、エクスポートする
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
