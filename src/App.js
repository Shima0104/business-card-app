import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ★ 我らが、創造した、すべての、世界（ページ）と、案内人を、召喚する
import Navbar from './components/Navbar';
import CardEditor from './pages/CardEditor';
import CardPage from './components/CardPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      {/* ★ 案内人は、常に、世界の、一番上に、存在する */}
      <Navbar />
      
      {/* ★ 世界の、法則（ルート）は、案内人の、下に、存在する */}
      <Routes>
        <Route path="/" element={<CardEditor />} />
        <Route path="/edit" element={<CardEditor />} /> {/* ★ /edit も、新規作成として、扱う */}
        <Route path="/edit/:cardId" element={<CardEditor />} />
        <Route path="/card/:cardId" element={<CardPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
