import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Grid, Card, CardContent } from '@mui/material';

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
      // Promise.allで、すべての画像のBase64変換を待つ
      const base64Promises = images.map(image => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(image.file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      });

      const base64Strings = await Promise.all(base64Promises);
      
      // 非常に長いので、圧縮してURLに含める（ここでは単純なエンコードのみ）
      const encodedImages = encodeURIComponent(JSON.stringify(base64Strings));
      
      navigate(`/card?images=${encodedImages}`);

    } catch (err) {
      setError('画像の処理中にエラーが発生しました。');
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
            {loading ? '作成中...' : '名刺を作成'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadPage;
