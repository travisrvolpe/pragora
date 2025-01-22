// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';
import logo from "../assets/images/ZERO_CROP.PNG";

function Home() {
  return (
    <div className="homepage-container">
      <div className="hero-section">
        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="content welcome-box">
          {/* Logo Section */}
          <img
            src={logo}
            alt="Pragora Logo"
            className="logo"
          />

          <h1 className="title">Welcome to Pragora</h1>
          <p className="subtitle">Your hub for meaningful discussions and insights!</p>

          {/* Main Sections */}
          <div className="section-container">
            <section className="main-section">
              <h2>Explore Popular Discussions</h2>
              <p>
                Join conversations on topics you care about. Share your thoughts and engage with the community.
              </p>
              <Link to="/Dialectica" className="button button-primary">
                Explore Dialectica
              </Link>
            </section>

            <section className="main-section">
              <h2>New Here?</h2>
              <p>
                Sign up to start participating in discussions and building your reputation.
              </p>
              <Link to="/register" className="button button-secondary">
                Get Started
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
