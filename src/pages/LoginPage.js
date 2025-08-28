import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ★ 帰還の儀式
  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      // ★ 呪文を唱える！
      const authInstance = getAuth();
await signInWithEmailAndPassword(authInstance, email, password);
      navigate('/'); // 成功したら、トップページへ
    } catch (err) {
      setError(err.message); // 失敗したら、理由を表示
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: '400px', width: '100%' }}>
        <Typography variant="h4" gutterBottom>ログイン</Typography>
        <form onSubmit={handleLogin}>
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
          <Button type="submit" variant="contained" fullWidth>ログイン</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
