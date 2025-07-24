import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SwipeableCardView from './components/SwipeableCardView';
import UploadPage from './components/UploadPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/card/:id" element={<SwipeableCardView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
