
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/layout.css';

function Navbar() {
  return (
    <nav className="navbar">
        <ul>
            <li>
                <NavLink to="/" className={({isActive}) => (isActive ? 'active' : '')}>
                    Home
                </NavLink>
            </li>
            <li>
                <NavLink to="Dialectica" className={({isActive}) => (isActive ? 'active' : '')}>
                    Dialectica
                </NavLink>
            </li>
            <li>
                <NavLink to="/discussions" className={({isActive}) => (isActive ? 'active' : '')}>
                    Discussions
                </NavLink>
            </li>
            <li>
                <NavLink to="/profile" className={({isActive}) => (isActive ? 'active' : '')}>
                    Profile
                </NavLink>
            </li>
            <li>
                <NavLink to="/login" className={({isActive}) => (isActive ? 'active' : '')}>
                    Login
                </NavLink>
            </li>
            <li>
                <NavLink to="/register" className={({isActive}) => (isActive ? 'active' : '')}>
                    Register
                </NavLink>
            </li>
        </ul>
    </nav>
  );
}

export default Navbar;
