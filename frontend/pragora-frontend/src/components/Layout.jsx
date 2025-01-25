import React from 'react';
import Navbar from './NavBar';
import TopBar from './TopBar';
import Footer from './Footer';
import Sidebar from './SideBar';
import '../styles/layout.css';

const Layout = ({ children, categories, selectedCategory, onSelectCategory, onSubcategoryChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <Navbar />
      <div className="flex flex-grow mt-[60px]">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          onSubcategoryChange={onSubcategoryChange}
        />
        <main className="flex-grow p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
