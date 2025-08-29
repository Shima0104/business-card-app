import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CardEditor from './pages/CardEditor';
import CardPage from './components/CardPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { user, loading } = useAuth();

  return (
    <Router>
      <Navbar user={user} />
      
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
