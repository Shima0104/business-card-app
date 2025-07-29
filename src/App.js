import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import CardPage from './components/CardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        {/* '/card' というパスを明確に定義する */}
        <Route path="/card" element={<CardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
