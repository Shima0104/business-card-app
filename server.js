// 1. 必要な部品を読み込む
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// 2. Expressアプリを初期化
const app = express();
const PORT = process.env.PORT || 3001;

// 3. 便利な機能を有効にする (Middleware)
app.use(cors()); // 他のドメインからのアクセスを許可する

// 4. アップロードされた画像を保存する場所の設定
const upload = multer({ dest: 'uploads/' });

// 5. ユーザーがアップロードした画像にアクセスできるようにする設定
// 例: /uploads/xxxxx というURLで画像が見られるようになる
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Reactアプリの完成版（buildフォルダ）を見せる設定
app.use(express.static(path.join(__dirname, 'build')));


// -------------------- ここから下が、URLごとの具体的な処理 --------------------

// 7. 画像アップロード用のAPIルート
// POST /api/upload というURLに来たリクエストを処理する
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  // ファイルがアップロードされなかった場合のエラー処理
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '画像がアップロードされていません。' });
  }

  // アップロードされたファイルの新しいURLのリストを作成
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  
  // 成功したことを、URLのリストと一緒にフロントエンドに返す
  res.json({ message: 'アップロード成功！', urls: urls });
});

// 8. その他のすべてのリクエストに対する処理
// API以外のすべてのURLに対して、Reactアプリ本体（index.html）を返す
// これが、画面を正しく表示させるための「最後の砦」
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// 9. サーバーを指定したポートで起動する
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
