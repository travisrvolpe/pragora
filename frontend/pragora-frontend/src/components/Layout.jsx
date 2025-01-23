// components/Layout.jsx
import React from 'react';
import Navbar from './NavBar';
import TopBar from './TopBar';
import Footer from './Footer';
import '../styles/layout.css';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <Navbar />
      <main className="flex-grow p-8 mt-[60px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
