import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ★ 創造の儀式
  const handleSignUp = async (event) => {
    event.preventDefault();
    setError('');
    try {
     const authInstance = getAuth();
await createUserWithEmailAndPassword(authInstance, email, password);
      alert('アカウントを作成しました！');
      navigate('/'); // 成功したら、トップページへ
    } catch (err) {
      setError(err.message); // もし失敗したら、その理由を表示する
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: '400px', width: '100%' }}>
        <Typography variant="h4" gutterBottom>新規登録</Typography>
        <form onSubmit={handleSignUp}>
          <TextField
            label="メールアドレス"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="パスワード"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth>登録する</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SignUpPage;
