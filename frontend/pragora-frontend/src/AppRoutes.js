// src/AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile";
import DialecticaHome from './pages/DialecticaHome';
import DiscussionView from './pages/DiscussionView';
import CreateContent from "./pages/CreateContent";
import DiscussionList from './pages/DiscussionList';
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/Dialectica" element={<DialecticaHome />} />
        <Route path="/create-content" element={<CreateContent />} />
        <Route path="/discussions/:id" element={<DiscussionView />} />
        <Route path="/discussions" element={<DiscussionList />} />
        <Route path="/TAP" element={<TAPHome />} />
        <Route path="/PAN" element={<PANHome />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
