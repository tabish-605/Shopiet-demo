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
import ErrorBoundary from './ErrorBoundary.jsx';
import pnf from './assets/pnf-404.svg'

const NotFound = () => {
  return (
    <div>
      <div className='error-div flex-col'> <div className="eimg"><img loading="lazy"  src={pnf} id='error-404' className="item-detail-image" /></div></div>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <ErrorBoundary>
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
       <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);
