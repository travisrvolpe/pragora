import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Common/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserProfile from "./pages/profile/Profile";
import DialecticaHome from './pages/Dialectica/DialecticaHome';
import PostView from './pages/Dialectica/PostView';
import CreateContent from "./pages/Dialectica/CreateContent";
import WriteArticle from "./pages/Dialectica/WriteArticle";
import ShareThoughts from './pages/Dialectica/ShareThoughts';
import ShareImage from './pages/Dialectica/ShareImage';
import TAPHome from './pages/TAP/TAPHome';
import PANHome from './pages/PAN/PANHome';
import './styles/layout.css';

const AppRoutes: React.FC = () => {
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
        <Route path="/share-image" element={<ShareImage />} />
        <Route path="/write-article" element={<WriteArticle />} />
        <Route path="/post/:post_id" element={<PostView />} />
        <Route path="/TAP" element={<TAPHome />} />
        <Route path="/PAN" element={<PANHome />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;