import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged, getAuth } from 'firebase/auth';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // ★ 現在ログインしているアカウントの情報を保存する

  // ★ アカウントの状態変化を、常に監視し続ける目
  useEffect(() => {
    const authInstance = getAuth();
const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => { ... });
      setUser(currentUser);
    });
    return () => unsubscribe(); // 監視を止める
  }, []);

  // ★ ログアウト
  const handleLogout = async () => {
    try {
      const authInstance = getAuth();
await signOut(authInstance);
      navigate('/login'); // ログアウトしたら、ログインの門へ
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          縦スワイプ名刺アプリ
        </Typography>
        <Box>
          {user ? (
            // ★ ログイン中なら...
            <>
              <Button color="inherit" component={RouterLink} to="/edit">新規作成</Button>
              <Button color="inherit" onClick={handleLogout}>ログアウト</Button>
            </>
          ) : (
            // ★ ログアウト中なら...
            <>
              <Button color="inherit" component={RouterLink} to="/login">ログイン</Button>
              <Button color="inherit" component={RouterLink} to="/signup">新規登録</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
