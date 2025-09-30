import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const MyPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ maxWidth: '900px', mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          マイページ
        </Typography>
        <Typography variant="body1">
          ここに、あなたが作成した名刺の一覧が表示されます。
        </Typography>
        {/* 次のステップで、ここに、Firestoreから取得した、名刺のリストを、表示します */}
      </Paper>
    </Box>
  );
};

export default MyPage;
