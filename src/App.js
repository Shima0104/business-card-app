import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // ★
import CardEditor from './pages/CardEditor';
import CardPage from './components/CardPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth'; // ★

function App() {
  const { user, loading } = useAuth(); // ★ Navbarに渡すために、ここで魂の状態を確認

  return (
    <Router>
      <Navbar user={user} /> {/* ★ Navbarに、魂の、状態を、渡す */}
      
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/card/:cardId" element={<CardPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- Protected Routes --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <CardEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit" 
          element={
            <ProtectedRoute>
              <CardEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit/:cardId" 
          element={
            <ProtectedRoute>
              <CardEditor />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
