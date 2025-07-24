import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, TextField, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const UploadPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages((prev) => [...prev, ...files]);

    // Convert images to base64 immediately
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setImageUrls((prev) => [...prev, base64String]);
        console.log('Preview URL:', base64String);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (uploading) return;
    setUploading(true);
    setError(null);

    try {
      // Validate images
      if (images.length === 0) {
        throw new Error('画像が選択されていません');
      }

      // Validate file size
      const totalSize = images.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('画像の合計サイズは5MBを超えることはできません');
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      // Use axios for API request with timeout
      try {
        const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000, // 30秒のタイムアウト
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }).then(response => {
        console.log('Upload response:', response.data);
        const { urls } = response.data;
        
        // URLパラメータに画像URLをエンコード
        const cardId = Date.now();
        navigate(`/card/${cardId}?images=${encodeURIComponent(urls.join(','))}`);
      }).catch(error => {
        console.error('Upload error:', error);
        setError('画像のアップロードに失敗しました');
        
        // エラーメッセージを表示
        if (error.response) {
          setError(error.response.data.error || 'アップロードに失敗しました');
        } else if (error.request) {
          setError('サーバーに接続できません');
        } else {
          setError('リクエストの作成に失敗しました');
        }
      }).finally(() => {
        setUploading(false);
      });
    } catch (error) {
      console.error('Error:', error);
      setError('アップロード処理中にエラーが発生しました');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '600px',
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              縦スワイプ型名刺作成
            </Typography>
            
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  画像をアップロードしてください
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="contained"
                    component="span"
                    fullWidth
                  >
                    画像を選択
                  </Button>
                </label>
              </Box>
              
              {imageUrls.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    プレビュー:
                  </Typography>
                  <Grid container spacing={2}>
                    {imageUrls.map((url, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <img
                          src={url}
                          alt={`preview-${index}`}
                          style={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                disabled={images.length === 0 || uploading}
              >
                {uploading ? 'アップロード中...' : '名刺を作成'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default UploadPage;
