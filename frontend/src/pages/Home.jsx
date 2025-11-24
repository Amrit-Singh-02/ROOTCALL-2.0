// import React, { useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import withAuth from '../utils/withAuth';
// import { AuthContext } from '../contexts/AuthContext';
// import '../styles/home.style.css';

// // Get backend URL from .env file
// const server = process.env.REACT_APP_BACKEND_URL;

// const Home = () => {
//   const navigate = useNavigate();
//   const [meetingCode, setMeetingCode] = useState('');
//   const authContext = useContext(AuthContext);
//   const addToUserHistory = authContext?.addToUserHistory;

//   const handleJoinVideoCall = async () => {
//     if (!meetingCode.trim()) {
//       alert('Please enter a meeting code');
//       return;
//     }
    
//     try {
//       if (addToUserHistory) {
//         await addToUserHistory(meetingCode);
//       }
//       navigate(`/${meetingCode}`);
//     } catch (error) {
//       console.error('Error joining video call:', error);
//     }
//   };

//   const logout = async () => {
//     try {
//       if (server) {
//         await fetch(`${server}/api/v1/users/logout`, {
//           method: 'POST',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//       navigate('/auth');
//     } catch (error) {
//       console.error('Logout failed:', error);
//       navigate('/auth');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleJoinVideoCall();
//     }
//   };

//   return (
//     <div className="home-container">
//       {/* Glassmorphic Navigation Bar */}
//       <nav className="home-navbar">
//         <div className="navbar-content">
//           {/* Logo Container - Pill Shaped */}
//           <div className="navbar-logo-container">
//             <svg
//               width="120"
//               height="32"
//               viewBox="0 0 200 50"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               onClick={() => navigate('/')}
//               className="navbar-logo"
//             >
//               {/* <path d="M20 10L20 40L40 25Z" fill="#D97706" /> */}
//               <text
//                 x="50"
//                 y="32"
//                 fontFamily="Arial, sans-serif"
//                 fontSize="25"
//                 fontWeight="800"
//                 fill="white"
//               >
//                 ROOTCALL
//               </text>
//             </svg>
//           </div>

//           {/* Right Menu */}
//           <div className="navbar-menu">
//             <button
//               className="navbar-text-btn"
//               onClick={() => navigate('/history')}
//             >
//               History
//             </button>

//             <button
//               className="navbar-logout-btn"
//               onClick={logout}
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="home-content">
//         <div className="home-grid">
//           {/* Left Panel */}
//           <div className="home-left-panel">
//             <div className="home-welcome-section">
//               <h1 className="home-title">Start a Video Call</h1>
//               <p className="home-subtitle">
//                 Join or create a meeting with your unique code
//               </p>

//               {/* Meeting Code Input Section */}
//               <div className="home-input-section">
//                 <div className="home-input-group">
//                   <input
//                     type="text"
//                     value={meetingCode}
//                     onChange={(e) => setMeetingCode(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Enter meeting code"
//                     className="home-meeting-input"
//                   />
//                 </div>
//                 <button 
//                   onClick={handleJoinVideoCall}
//                   className="home-join-btn"
//                   disabled={!meetingCode.trim()}
//                 >
//                   Join Call
//                 </button>
//               </div>

          
//             </div>
//           </div>

//           {/* Right Panel */}
//           <div className="home-right-panel">
//             <div className="home-image-container">
//               <div className="home-image-placeholder">
//                 <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none">
//                   <rect width="300" height="400" fill="rgba(255, 255, 255, 0.05)" rx="12" />
//                   <circle cx="150" cy="150" r="40" fill="rgba(255, 255, 255, 0.1)" />
//                   <path 
//                     d="M150 120C130 120 115 135 115 155C115 175 130 190 150 190C170 190 185 175 185 155C185 135 170 120 150 120Z" 
//                     fill="rgba(255, 255, 255, 0.15)"
//                   />
//                   <path 
//                     d="M150 210Q120 230 100 280L200 280Q180 230 150 210Z" 
//                     fill="rgba(255, 255, 255, 0.15)"
//                   />
//                   <circle cx="100" cy="60" r="15" fill="rgba(59, 130, 246, 0.3)" />
//                   <circle cx="220" cy="80" r="20" fill="rgba(168, 85, 247, 0.3)" />
//                   <circle cx="250" cy="280" r="18" fill="rgba(236, 72, 153, 0.3)" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default withAuth(Home);




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
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const authContext = useContext(AuthContext);
  const addToUserHistory = authContext?.addToUserHistory;

  // Generate random hexadecimal meeting code
  const generateMeetingCode = () => {
    const length = Math.random() > 0.5 ? 6 : 7; // Randomly choose 6 or 7 characters
    const characters = '0123456789abcdef';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateMeeting = () => {
    const newCode = generateMeetingCode();
    setGeneratedCode(newCode);
    setShowShareModal(true);
  };

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

  const handleJoinGeneratedMeeting = async () => {
    try {
      if (addToUserHistory) {
        await addToUserHistory(generatedCode);
      }
      setShowShareModal(false);
      navigate(`/${generatedCode}`);
    } catch (error) {
      console.error('Error joining video call:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getMeetingLink = () => {
    return `${window.location.origin}/${generatedCode}`;
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

              {/* OR Divider */}
              <div className="home-divider">
                <span className="divider-line"></span>
                <span className="divider-text">OR</span>
                <span className="divider-line"></span>
              </div>

              {/* Create New Meeting Button */}
              <button 
                onClick={handleCreateMeeting}
                className="home-create-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Create New Meeting
              </button>
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

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Meeting Created!</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Share this meeting code with participants to invite them
              </p>

              {/* Meeting Code Display */}
              <div className="meeting-code-display">
                <span className="meeting-code-label">Meeting Code:</span>
                <div className="meeting-code-value">
                  <span className="code-text">{generatedCode}</span>
                  <button 
                    className="copy-icon-btn"
                    onClick={() => copyToClipboard(generatedCode)}
                    title="Copy code"
                  >
                    {copySuccess ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Meeting Link */}
              <div className="meeting-link-display">
                <span className="meeting-link-label">Meeting Link:</span>
                <div className="meeting-link-value">
                  <span className="link-text">{getMeetingLink()}</span>
                  <button 
                    className="copy-icon-btn"
                    onClick={() => copyToClipboard(getMeetingLink())}
                    title="Copy link"
                  >
                    {copySuccess ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {copySuccess && (
                <div className="copy-success-message">
                  ✓ Copied to clipboard!
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-join-btn"
                onClick={handleJoinGeneratedMeeting}
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Home);