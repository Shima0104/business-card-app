import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import {
  Box, Button, Paper, Typography, Grid, CircularProgress, TextField, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ Cloudinary情報★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ----------------------------------------------------
// --- 新機能：各画像の情報を管理するコンポーネント ---
// ----------------------------------------------------
const ImageEditor = ({ image, onUpdate, onRemove }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
      <img src={image.previewUrl} alt="preview" style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
      <IconButton
        aria-label="delete"
        onClick={() => onRemove(image.id)}
        sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <TextField
        label="ボタンのテキスト"
        variant="standard"
        fullWidth
        size="small"
        value={image.buttonText}
        onChange={(e) => onUpdate(image.id, 'buttonText', e.target.value)}
        sx={{ mt: 1 }}
      />
      <TextField
        label="リンク先のURL"
        variant="standard"
        fullWidth
        size="small"
        value={image.linkUrl}
        onChange={(e) => onUpdate(image.id, 'linkUrl', e.target.value)}
        sx={{ mt: 1 }}
      />
    </Paper>
  );
};


// ----------------------------------------------------
// --- UploadPageコンポーネント本体（大改造） ---
// ----------------------------------------------------
const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- 画像がアップロードされた時の処理 ---
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImageObjects = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file: file,
      previewUrl: URL.createObjectURL(file),
      buttonText: '', // ★ 新しいデータを初期化
      linkUrl: '',     // ★ 新しいデータを初期化
    }));
    setImages(prev => [...prev, ...newImageObjects]);
  };

  // --- 新機能：テキスト入力欄が変更された時の処理 ---
  const handleUpdateImageInfo = (id, field, value) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, [field]: value } : img
    ));
  };
  
  // --- 画像が削除された時の処理 ---
  const handleRemoveImage = (idToRemove) => {
    setImages(items => items.filter(item => item.id !== idToRemove));
  };

  // --- ★★★ 名刺作成ボタンが押された時の処理（最重要） ★★★ ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (images.length === 0) {
      setError('画像が選択されていません。');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. まず、すべての画像をCloudinaryにアップロード
      const uploadPromises = images.map(image => {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        return axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
      });
      const uploadResponses = await Promise.all(uploadPromises);
      
      // 2. アップロード後のデータと、入力されたテキスト情報を合体させる
      const cardSlides = images.map((image, index) => ({
        imageUrl: uploadResponses[index].data.secure_url, // CloudinaryのURL
        buttonText: image.buttonText,
        linkUrl: image.linkUrl,
        order: index, // 表示順を保存
      }));

      // 3. この完成したデータを、Firestoreに保存する！
      const docRef = await addDoc(collection(db, "cards"), {
        slides: cardSlides,
        createdAt: serverTimestamp(), // 作成日時を記録
      });

      // 4. Firestoreが発行した、新しいIDを使って、ページ遷移する
      navigate(`/card/${docRef.id}`);

    } catch (err) {
      console.error("Submit failed:", err);
      setError('作成中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // --- UIの描画部分 ---
  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>名刺情報入力</Typography>
        {error && <Typography color="error">{error}</Typography>}
        
        <Button variant="contained" component="label" fullWidth sx={{ mb: 3 }}>
          画像を追加
          <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
        </Button>
        
        <Grid container spacing={3}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <ImageEditor 
                image={image} 
                onUpdate={handleUpdateImageInfo} 
                onRemove={handleRemoveImage} 
              />
            </Grid>
          ))}
        </Grid>

        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={loading || images.length === 0}
          onClick={handleSubmit}
          sx={{ mt: 3, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : 'この内容で名刺を作成する'}
        </Button>
      </Paper>
    </Box>
  );
};

export default UploadPage;
