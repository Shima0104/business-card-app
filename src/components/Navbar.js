import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

// ★ App.jsから、魂の、状態を、受け取る
const Navbar = ({ user }) => { 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
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
            <>
              {/* ★ /mypage のような、マイページへの、リンクも、将来、ここに追加できる */}
              <Button color="inherit" component={RouterLink} to="/">マイページ</Button> 
              <Button color="inherit" onClick={handleLogout}>ログアウト</Button>
            </>
          ) : (
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
