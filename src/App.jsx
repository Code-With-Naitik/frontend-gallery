import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminPanel from './admin/AdminPanel';
import AdminLogin from './admin/AdminLogin';
import AdminRegister from './admin/AdminRegister';
import AdminProfile from './admin/AdminProfile';
import UserManagement from './components/UserManagement';
import PromptDetail from './components/PromptDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import CustomCursor from './components/CustomCursor';
import './App.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Router>
          <Navbar />
          <div className="App">
            <CustomCursor />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />            <Route
                path="/prompt/:id"
                element={<PromptDetail />}
              />            <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
