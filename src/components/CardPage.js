import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

const CardPage = () => {
  const [searchParams] = useSearchParams();
  const imagesParam = searchParams.get('images');

  let decodedParam = '';
  let images = [];
  let error = '';

  try {
    if (imagesParam) {
      decodedParam = decodeURIComponent(imagesParam);
      images = decodedParam.split(',');
    }
  } catch (e) {
    error = e.message;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>デバッグ情報</Typography>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">1. URLから取得した生のパラメータ (imagesParam):</Typography>
        <Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {imagesParam || 'null または undefined (パラメータ自体が存在しません)'}
        </Typography>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">2. デコード後の文字列 (decodedParam):</Typography>
        <Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {decodedParam || '空文字列'}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">3. カンマで分割した後の配列 (images):</Typography>
        <Typography component="pre" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(images, null, 2)}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">4. 配列の要素数 (images.length):</Typography>
        <Typography sx={{ fontFamily: 'monospace' }}>
          {images.length}
        </Typography>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">5. 処理中に発生したエラー:</Typography>
        <Typography color="error">
          {error || 'なし'}
        </Typography>
      </Paper>

    </Box>
  );
};

export default CardPage;
