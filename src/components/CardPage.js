import React from 'react';
import { Box, Typography } from '@mui/material';

const CardPage = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center', mt: 10 }}>
      <Typography variant="h1" gutterBottom>
        表示成功！
      </Typography>
      <Typography variant="h5">
        このページが表示されていれば、ルーティングは正しく機能しています。
      </Typography>
      <Typography sx={{ mt: 4 }}>
        あと一歩です。この結果を教えてください。
      </Typography>
    </Box>
  );
};

export default CardPage;
