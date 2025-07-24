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
    // 選択されたファイルを取得
    const selectedFiles = Array.from(event.target.files);

    // ファイルごとに、{file本体, previewUrl} のオブジェクトを作成
    const newImages = selectedFiles.map(file => ({
      file: file,
      previewUrl: URL.createObjectURL(file) // プレビュー用のURLを一時的に生成
    }));

    // imagesステートを更新
    setImages(prevImages => [...prevImages, ...newImages]);
  };

const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploading) return;
    setUploading(true);
    setError(null);

    try {
      // 1. バリデーション（入力チェック）
      if (images.length === 0) {
        throw new Error('画像が選択されていません。');
      }

      const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);
      if (totalSize > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('画像の合計サイズは5MBを超えることはできません。');
      }

      // 2. アップロード用のデータ（FormData）を作成
      const formData = new FormData();
      images.forEacsh((image) => {
        // 'images' という名前で、ファイルの実体を追加していく
        formData.append('images', image.file);
      });

      // 3. サーバーにデータを送信し、レスポンスを待つ
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30秒でタイムアウト
        onUploadProgress: (progressEvent) => {
          // 進捗状況をコンソールに表示（任意）
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`アップロード進捗: ${percentCompleted}%`);
          }
        },
      });

      // 4. 成功した場合の処理
      console.log('アップロード成功:', response.data);
      const { urls } = response.data; // サーバーから返されたURLのリスト

      // 5. 成功ページに遷移する
      const cardId = Date.now(); // ユニークIDを生成
      const encodedUrls = encodeURIComponent(urls.join(','));
      navigate(`/card/${cardId}?images=${encodedUrls}`);

    } catch (error) {
      // 6. エラーが発生した場合の処理
      console.error('アップロード失敗:', error);
      // 分かりやすいエラーメッセージを画面に表示する
      if (error.response) { // サーバーからのエラーレスポンスがある場合
        setError(error.response.data.error || 'サーバー側でエラーが発生しました。');
      } else if (error.code === 'ECONNABORTED') { // タイムアウトした場合
        setError('タイムアウトしました。通信環境の良い場所で再度お試しください。');
      } else if (error.request) { // サーバーにリクエストが届かなかった場合
        setError('サーバーに接続できませんでした。');
      } else { // その他の予期せぬエラー
        setError(error.message || '不明なエラーが発生しました。');
      }

    } finally {
      // 7. 成功しても失敗しても、最後に必ず実行する処理
      setUploading(false); // 「アップロード中...」を解除
    }
  };

    /*ここまで*/

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
              
              {images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    プレビュー:
                  </Typography>
                  <Grid container spacing={2}>
                    {images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <img
                          src={image.previewUrl}
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
