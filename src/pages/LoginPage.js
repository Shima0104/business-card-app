import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const auth = getAuth(); // ★ 儀式の、直前に、道を、確保
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: '400px', width: '100%' }}>
        <Typography variant="h4" gutterBottom>ログイン</Typography>
        <form onSubmit={handleLogin}>
          <TextField label="メールアドレス" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="パスワード" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth>ログイン</Button>
        </form>

　　　　　<Box sx={{ mt: 2, textAlign: 'center' }}>
  <Typography variant="body2">
    アカウントをお持ちでないですか？{' '}
    <RouterLink to="/signup" style={{ textDecoration: 'none' }}>
      <Button variant="text">新規登録はこちら</Button>
    </RouterLink>
  </Typography>
</Box>
            
      </Paper>
    </Box>
  );
};

export default LoginPage;
