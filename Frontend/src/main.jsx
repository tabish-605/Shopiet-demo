import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import './css/index.css';

import ErrorBoundary from './ErrorBoundary.jsx';

import Navbar from './Navbar.jsx';
import Login from './Login.jsx';
import App from './App.jsx';
import ItemDetail from './ItemDetail.jsx';
import CategoryPage from './CategoryPage.jsx';

const SignUp = lazy(()=>import('./SignUp.jsx'))
const PrivateRoutes = lazy(() => import( './utils/PrivateRoute.jsx'));
const SearchPage = lazy(() => import('./SearchPage.jsx'));
const ProfileDetail = lazy(() => import('./ProfileDetail.jsx'));
const SavedItems = lazy(() => import('./SavedPage.jsx'));
const UpdateProfile = lazy(() => import('./UpdateProfile.jsx'));
const UploadItem = lazy(() => import('./UploadItem.jsx'));
const NotFound = lazy(() => import('./NotFound.jsx'));
const Chat = lazy(() => import('./Chat.jsx'));
const Conversations = lazy(()=>import('./Conversations.jsx'))
const suspenseLoad = () =>{
  return ( <div style={{height:'100svh', justifyContent:'center'}} className='flex-col'><span className="cssload-loader"><span className="cssload-loader-inner"></span></span></div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/item/:slug" element={<ItemDetail />} />
            <Route path="/category/:item_category_name" element={<CategoryPage />} />
            <Route path="/signup" element={<Suspense fallback={suspenseLoad()}><SignUp /></Suspense>} />
            <Route path="/search/:item_name" element={<Suspense fallback={suspenseLoad()}><SearchPage /></Suspense>} />
            <Route path="/profile/:username" element={<Suspense fallback={suspenseLoad()}><ProfileDetail /></Suspense>} />
           
            <Route element={<Suspense fallback={suspenseLoad()}><PrivateRoutes /></Suspense>}>
              <Route path="/upload" element={<Suspense fallback={suspenseLoad()}><UploadItem /></Suspense>} />
              <Route path="/saved-items/:username" element={<Suspense fallback={suspenseLoad()}><SavedItems /></Suspense>} />
              <Route path="/update-profile" element={<Suspense fallback={suspenseLoad()}><UpdateProfile /></Suspense>} />
              <Route path="/chat/:recipient" element={<Suspense fallback={suspenseLoad()}><Chat /></Suspense>} />
              <Route path="/conversations/:username" element={<Suspense fallback={suspenseLoad()}><Conversations /></Suspense>}/>
            </Route>
            <Route path="*" element={<Suspense fallback={suspenseLoad()}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  </React.StrictMode>
);