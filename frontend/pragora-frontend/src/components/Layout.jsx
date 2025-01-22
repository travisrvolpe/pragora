// components/Layout.jsx
import React from 'react';
import Navbar from './NavBar';
import TopBar from './TopBar';
import Footer from './Footer';
import '../styles/layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <TopBar />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
