import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-brand">MERN Chat</div>
        <div className="navbar-links">
          {token ? (
            <>
              <Link to="/chat" className="nav-link">Chat</Link>
              <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-btn signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className="hero-section">
        <h1>Welcome to MERN Chat</h1>
        <p>Secure messaging with JWT authentication</p>
        {!token && (
          <div className="hero-buttons">
            <Link to="/signup" className="hero-btn primary-btn">Get Started</Link>
            <Link to="/login" className="hero-btn secondary-btn">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
