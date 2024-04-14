import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import App from './App.jsx';
import './css/index.css';
import Login from './Login.jsx';
import PrivateRoutes from './utils/PrivateRoute.jsx';
import { AuthProvider } from './context/AuthContext'
import SignUp from './SignUp.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Add private routes by wrapping them with PrivateRoute */}
       <Route element={<PrivateRoutes/>}>
        <Route path="/" element={<App />} />
       </Route>
        
      </Routes>
    </BrowserRouter></AuthProvider>
  </React.StrictMode>
);
