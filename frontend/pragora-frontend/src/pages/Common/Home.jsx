import React, { useState } from "react";
import { UserPlus, LogIn, Brain, Target, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext"; // Import AuthContext for login
import "../../styles/pages/Home.css";
import logo from "../../assets/images/ZERO_CROP.PNG";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth(); // Get loginUser function from AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password }); // Call login function
      console.log("Login successful!"); // Optional: log success
    } catch (error) {
      console.error("Login failed:", error); // Handle login errors
    }
  };

  return (
    <div className="home-page">
      <div className="main-content">
        {/* Header Section */}
        <div className="header">
          <div className="logo">
            <img src={logo} alt="Pragora Logo" />
          </div>
          <h1>Welcome to Pragora</h1>
          <p className="subtitle">
            Transform knowledge into action through evidence-based post,
            personalized planning, and community-driven support.
          </p>
        </div>

        {/* Authentication Section */}
        <div className="auth-container">
          <div className="auth-section">
            <button className="register-btn">
              <UserPlus size={20} />
              Register Now
            </button>
            <span className="or-divider">or</span>
            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="login-btn">
                <LogIn size={16} />
                Login
              </button>
            </form>
          </div>
        </div>

        {/* Features Section */}
        <div className="features">
          {/* Dialectica */}
          <div className="feature-card">
            <div className="feature-header">
              <Brain size={24} className="icon blue" />
              <h2>Dialectica</h2>
            </div>
            <p className="feature-type">Evidence-based post</p>
            <p className="feature-description">
              Engage in high-quality post where AI-validated content and collaborative
              moderation ensure logical, evidence-based dialogue focused on practical solutions.
            </p>
            <button className="feature-btn">Explore Posts</button>
          </div>

          {/* TAP */}
          <div className="feature-card">
            <div className="feature-header">
              <Target size={24} className="icon green" />
              <h2>TAP</h2>
            </div>
            <p className="feature-type">Tactical Action Planning</p>
            <p className="feature-description">
              Transform insights into personalized action plans that adapt to your goals,
              resources, and progress. Get step-by-step guidance for achieving measurable outcomes.
            </p>
            <button className="feature-btn">View Demo</button>
          </div>

          {/* PAN */}
          <div className="feature-card">
            <div className="feature-header">
              <Users size={24} className="icon purple" />
              <h2>PAN</h2>
            </div>
            <p className="feature-type">Pragmatic Action Network</p>
            <p className="feature-description">
              Connect with mentors, experts, and peers who share your goals. Access resources,
              form accountability groups, and collaborate on shared initiatives.
            </p>
            <button className="feature-btn">View Demo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
