import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
// import Dashboard from './pages/(logined)/admin/AdminDashboard';
import AdminDashboard from './pages/(logined)/admin/AdminDashboard';
import UserDashboard from './pages/(logined)/user/UserDashboard';
import './App.css'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-page/dashboard" element={<AdminDashboard />} />
        <Route path="/user-page/dashboard" element={<UserDashboard />} />
        <Route path="/" element={<Login />} /> {/* Default to login */}
      </Routes>
    </Router>
  );
};

export default App;