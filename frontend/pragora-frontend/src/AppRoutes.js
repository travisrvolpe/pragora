// src/AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from "./pages/Profile";
import DialecticaHome from './pages/DialecticaHome';
import DiscussionView from './pages/DiscussionView';
import CreateContent from "./pages/CreateContent";
import WriteArticle from "./pages/WriteArticle";
import DiscussionList from './pages/DiscussionList';
import ShareThoughts from './pages/ShareThoughts';
import ShareImage from './pages/ShareImage';
import DiscussionDetail from './pages/DiscussionDetail';
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
        <Route path="/Dialectica" element={<DialecticaHome />} />
        <Route path="/create-content" element={<CreateContent />} />
        <Route path="/share-thoughts" element={<ShareThoughts />} />
        <Route path="/share-image" element={<ShareImage/>} />
        <Route path="/write-article" element={<WriteArticle/>} />
        <Route path="/discussions/:id" element={<DiscussionView />} />
        <Route path="/discussions" element={<DiscussionList />} />
        <Route path="/TAP" element={<TAPHome />} />
        <Route path="/PAN" element={<PANHome />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
