import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/home.style.css';

// Get backend URL from .env file
const server = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const authContext = useContext(AuthContext);
  const addToUserHistory = authContext?.addToUserHistory;

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      alert('Please enter a meeting code');
      return;
    }
    
    try {
      if (addToUserHistory) {
        await addToUserHistory(meetingCode);
      }
      navigate(`/${meetingCode}`);
    } catch (error) {
      console.error('Error joining video call:', error);
    }
  };

  const logout = async () => {
    try {
      if (server) {
        await fetch(`${server}/api/v1/users/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/auth');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinVideoCall();
    }
  };

  return (
    <div className="home-container">
      {/* Glassmorphic Navigation Bar */}
      <nav className="home-navbar">
        <div className="navbar-content">
          {/* Logo Container - Pill Shaped */}
          <div className="navbar-logo-container">
            <svg
              width="120"
              height="32"
              viewBox="0 0 200 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => navigate('/')}
              className="navbar-logo"
            >
              {/* <path d="M20 10L20 40L40 25Z" fill="#D97706" /> */}
              <text
                x="50"
                y="32"
                fontFamily="Arial, sans-serif"
                fontSize="25"
                fontWeight="800"
                fill="white"
              >
                ROOTCALL
              </text>
            </svg>
          </div>

          {/* Right Menu */}
          <div className="navbar-menu">
            <button
              className="navbar-text-btn"
              onClick={() => navigate('/history')}
            >
              History
            </button>

            <button
              className="navbar-logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        <div className="home-grid">
          {/* Left Panel */}
          <div className="home-left-panel">
            <div className="home-welcome-section">
              <h1 className="home-title">Start a Video Call</h1>
              <p className="home-subtitle">
                Join or create a meeting with your unique code
              </p>

              {/* Meeting Code Input Section */}
              <div className="home-input-section">
                <div className="home-input-group">
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter meeting code"
                    className="home-meeting-input"
                  />
                </div>
                <button 
                  onClick={handleJoinVideoCall}
                  className="home-join-btn"
                  disabled={!meetingCode.trim()}
                >
                  Join Call
                </button>
              </div>

              {/* Features */}
              {/* <div className="home-features">
                <div className="home-feature-item">
                  <div className="feature-icon">📹</div>
                  <p>Crystal Clear Video</p>
                </div>
                <div className="home-feature-item">
                  <div className="feature-icon">🔊</div>
                  <p>High Quality Audio</p>
                </div>
                <div className="home-feature-item">
                  <div className="feature-icon">🔒</div>
                  <p>End-to-End Encrypted</p>
                </div>
              </div> */}
            </div>
          </div>

          {/* Right Panel */}
          <div className="home-right-panel">
            <div className="home-image-container">
              <div className="home-image-placeholder">
                <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none">
                  <rect width="300" height="400" fill="rgba(255, 255, 255, 0.05)" rx="12" />
                  <circle cx="150" cy="150" r="40" fill="rgba(255, 255, 255, 0.1)" />
                  <path 
                    d="M150 120C130 120 115 135 115 155C115 175 130 190 150 190C170 190 185 175 185 155C185 135 170 120 150 120Z" 
                    fill="rgba(255, 255, 255, 0.15)"
                  />
                  <path 
                    d="M150 210Q120 230 100 280L200 280Q180 230 150 210Z" 
                    fill="rgba(255, 255, 255, 0.15)"
                  />
                  <circle cx="100" cy="60" r="15" fill="rgba(59, 130, 246, 0.3)" />
                  <circle cx="220" cy="80" r="20" fill="rgba(168, 85, 247, 0.3)" />
                  <circle cx="250" cy="280" r="18" fill="rgba(236, 72, 153, 0.3)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Home);
