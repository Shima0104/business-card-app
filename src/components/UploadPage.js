import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axiosをインポート
import { Box, Button, Paper, Typography, Grid, CircularProgress } from '@mui/material';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ Cloudinary情報★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const CLOUDINARY_CLOUD_NAME = 'ddgrrcn6r'; 
const CLOUDINARY_UPLOAD_PRESET = 'businesscardapp_unsigned_preset'; 
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(''); // 生成されたURLを保存する箱
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
      const encodedUrls = encodeURIComponent(imageUrls.join(','));
     
      // 完全なURLを組み立てる
      const newUrl = `${window.location.origin}/card?images=${encodedUrls}`;
      
      // ページ遷移する代わりに、生成されたURLをステートに保存する
      setGeneratedUrl(newUrl);

      // アップロードが完了したので、ローディング状態を解除する
      setLoading(false);    } catch (err) {
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
          {generatedUrl && (
            <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
              <Typography variant="h6" gutterBottom>
                完成！
              </Typography>
              <Typography variant="body2" gutterBottom>
                以下のURLを相手に共有してください。
              </Typography>
              <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', my: 1 }}>
                <Typography sx={{ wordBreak: 'break-all' }}>
                  {generatedUrl}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigator.clipboard.writeText(generatedUrl)}
                >
                  コピー
                </Button>
                {/* シェアボタンは、後でもっと高機能にできますが、まずは単純なリンクとして */}
                <Button 
                  variant="outlined" 
                  href={generatedUrl}
                  target="_blank" // 新しいタブで開く
                  rel="noopener noreferrer" // セキュリティ対策
                >
                  開く
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default UploadPage;
