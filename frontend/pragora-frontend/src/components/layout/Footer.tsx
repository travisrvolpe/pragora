import React from 'react';
import { Link } from 'react-router-dom';
import { FooterProps } from '../../types/layout';
import '../../styles/layout.css';

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="footer">
      <p>&copy; 2025 Dialectica. All rights reserved.</p>
      <p>
        <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
      </p>
    </footer>
  );
};

export default Footer;