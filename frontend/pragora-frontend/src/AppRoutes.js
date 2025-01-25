// src/AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from "./pages/Profile";
import DialecticaHome from './pages/DialecticaHome';
import PostView from './pages/PostView';
import CreateContent from "./pages/CreateContent";
import WriteArticle from "./pages/WriteArticle";
import ShareThoughts from './pages/ShareThoughts';
import ShareImage from './pages/ShareImage';
import TAPHome from './pages/TAPHome';
import PANHome from './pages/PANHome';
import './styles/layout.css';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/dialectica" element={<DialecticaHome />} />
        <Route path="/create-content" element={<CreateContent />} />
        <Route path="/share-thoughts" element={<ShareThoughts />} />
        <Route path="/share-image" element={<ShareImage/>} />
        <Route path="/write-article" element={<WriteArticle/>} />
        <Route path="/post/:post_id" element={<PostView />} />
        <Route path="/TAP" element={<TAPHome />} />
        <Route path="/PAN" element={<PANHome />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
