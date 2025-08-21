import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardPage from './components/CardPage';
import CardEditor from './pages/CardEditor'; // 新しいパスから、インポート

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<CardEditor />} /> {/* ★ 新規作成ページ */}
  <Route path="/edit/:cardId" element={<CardEditor />} /> {/* ★ 編集ページ */}
  <Route path="/card/:cardId" element={<CardPage />} />

      </Routes>
    </Router>
  );
}

export default App;
