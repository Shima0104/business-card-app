import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axiosをインポート
import { Box, Button, Paper, Typography, Grid, CircularProgress } from '@mui/material';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ここを、あなたのCloudinary情報に書き換えてください ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageObjects = files.map(file => ({
      file: file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...imageObjects]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (images.length === 0) {
      setError('画像が選択されていません。');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 全ての画像をCloudinaryにアップロードする処理
      const uploadPromises = images.map(image => {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        return axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
      });

      // すべてのアップロードが終わるのを待つ
      const uploadResponses = await Promise.all(uploadPromises);

      // アップロード結果から、画像のURLだけを抜き出す
      const imageUrls = uploadResponses.map(res => res.data.secure_url);

      // 短いURLのリストをURLにエンコードして、次のページに渡す
      const encodedUrls = encodeURIComponent(JSON.stringify(imageUrls));
      navigate(`/card?images=${encodedUrls}`);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('画像のアップロード中にエラーが発生しました。');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: '600px', width: '100%', p: 4 }}>
        <Typography variant="h4" gutterBottom>縦スワイプ型名刺作成</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
            画像を選択
            <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
          </Button>
          
          {images.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {images.map((image, index) => (
                <Grid item xs={4} key={index}>
                  <img src={image.previewUrl} alt="preview" style={{ width: '100%', borderRadius: '4px' }} />
                </Grid>
              ))}
            </Grid>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '名刺を作成'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadPage;
