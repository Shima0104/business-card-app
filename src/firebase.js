// 1. Firebaseから、必要な機能をインポートする
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. Firebaseプロジェクトの接続情報
const firebaseConfig = {
  apiKey: "AIzaSyBFShKtIH8hKw-SXwIp-LlEZEsrYaWhAjU",
  authDomain: "business-card-app-c01d8.firebaseapp.com",
  projectId: "business-card-app-c01d8",
  storageBucket: "business-card-app-c01d8.firebasestorage.app",
  messagingSenderId: "875047669215",
  appId: "1:875047669215:web:54f72251cab57c6306886a",
  measurementId: "G-LVMH43VH19"
};
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 3. Firebaseアプリを初期化する
const app = initializeApp(firebaseConfig);

// 4. Firestoreデータベースの機能を使えるように準備する
const db = getFirestore(app);

// 5. 他のファイルから、このdbを使えるように、エクスポートしておく
export { db };
