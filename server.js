require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// CORS設定
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static('public'));

// ルートパスの設定
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// APIルートの設定
app.use('/api', express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, 'uploads');
    console.log('Destination:', dest);
    
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log('Filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// API endpoint for uploading images
app.post('/api/upload', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      console.error('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      const urls = req.files.map(file => {
        return `http://localhost:${process.env.PORT || 3000}/uploads/${file.filename}`;
      });

      console.log('Uploaded files:', urls);
      res.json({ urls });
    } catch (error) {
      console.error('Processing error:', error);
      next(error);
    }
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = req.files.map(file => {
      return `http://localhost:${process.env.PORT}/uploads/${file.filename}`;
    });

    console.log('Uploaded files:', urls);
    res.json({ urls });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'ファイルアップロードエラー' });
  }

  if (err.message.includes('Only image files')) {
    return res.status(400).json({ error: '画像ファイルのみアップロードできます' });
  }

  res.status(500).json({ error: 'サーバーでエラーが発生しました' });
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404エラーのハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
