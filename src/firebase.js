// 1. Firebaseから、必要な「すべての」機能を、インポートする
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  setDoc,     // ★ 更新の、神を、召喚
  deleteDoc   // ★ 削除の、神を、召喚
} from "firebase/firestore";

// 2. あなたの、秘密の、接続情報
const firebaseConfig = {
  // ★★★ あなたの、firebaseConfigを、ここに ★★★
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
  setDoc,     // ★ 更新の、神を、派遣
  deleteDoc   // ★ 削除の、神を、派遣
};
