const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// --- Vercel対応の修正点 1 ---
// 保存先を、Vercelが唯一書き込みを許可している /tmp フォルダに変更
const upload = multer({ dest: '/tmp' });

// --- Vercel対応の修正点 2 ---
// /tmp にアップロードされた一時ファイルを見せるためのルート
app.use('/uploads', express.static('/tmp'));

// --- Vercel対応の修正点 3 ---
// Reactアプリのビルドフォルダを正しく見つけるためのパス指定
// Vercelでは、ビルド後の 'build' フォルダはプロジェクトのルートに配置される
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));


// -------------------- URLごとの具体的な処理 --------------------

// 画像アップロード用のAPIルート
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '画像がアップロードされていません。' });
  }

  // /tmp に保存されたファイルへのURLを生成
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  
  res.json({ message: 'アップロード成功！', urls: urls });
});

// その他のすべてのリクエストに対して、Reactアプリ本体（index.html）を返す
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
