import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import App from './App.jsx';
import './css/index.css';
import Login from './Login.jsx';
import PrivateRoutes from './utils/PrivateRoute.jsx';
import { AuthProvider } from './context/AuthContext'
import SignUp from './SignUp.jsx';
import UploadItem from './UploadItem.jsx';
import ItemDetail from './ItemDetail.jsx';
import CategoryPage from './CategoryPage.jsx';
import UpdateProfile from './UpdateProfile.jsx';
import SearchPage from './SearchPage.jsx';
import ProfileDetail from './ProfileDetail.jsx';
import SavedItems from './SavedPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/item/:slug" element={<ItemDetail />} />
        <Route path="/category/:item_category_name" element={<CategoryPage />} />
        <Route path="/search/:item_name" element={<SearchPage/>} />
        <Route path="/profile/:username" element={<ProfileDetail/>} />
       <Route element={<PrivateRoutes/>}>
        <Route path="/upload" element={<UploadItem/>} />
        <Route path="/save/:username/:slug" />
        <Route path="/saved-items/:username" element={<SavedItems/>}/>
        <Route path="/update-profile" element={<UpdateProfile/>} />
       </Route>
        
      </Routes>
    </BrowserRouter></AuthProvider>
  </React.StrictMode>
);
