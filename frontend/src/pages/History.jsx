import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css';

const History = () => {
  const authContext = useContext(AuthContext);
  const getHistoryOfUser = authContext?.getHistoryOfUser;

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (getHistoryOfUser) {
          const history = await getHistoryOfUser();
          setMeetings(history || []);
        }
      } catch (e) {
        console.error('Error fetching history:', e);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleJoinMeeting = (meetingCode) => {
    navigate(`/${meetingCode}`);
  };

  return (
    <div className="history-wrapper">
      {/* Glassmorphic Navigation Bar */}
      <nav className="history-navbar">
        <div className="history-navbar-content">
          {/* Logo */}
          <div >
            <svg
              width="120"
              height="32"
              viewBox="0 0 200 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => navigate('/')}
              className="history-logo"
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
          <div className="history-navbar-menu">
            <button
              className="history-back-btn"
              onClick={() => navigate('/home')}
              title="Go back home"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="history-content">
        <div className="history-container">
          {/* Header */}
          <div className="history-header">
            <h1 className="history-title">Meeting History</h1>
            <p className="history-subtitle">
              {meetings.length > 0
                ? `You have ${meetings.length} meeting${meetings.length !== 1 ? 's' : ''} in your history`
                : 'No meetings yet'}
            </p>
          </div>

          {/* History Cards Grid */}
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <p>Loading your history...</p>
            </div>
          ) : meetings.length !== 0 ? (
            <div className="history-grid">
              {meetings.map((meeting, index) => (
                <div key={index} className="history-card-wrapper">
                  <div className="history-card">
                    <div className="card-header">
                      <div className="meeting-icon">📞</div>
                      <span className="meeting-index">#{index + 1}</span>
                    </div>

                    <div className="card-content">
                      <div className="meeting-detail">
                        <label className="detail-label">Meeting Code</label>
                        <p className="detail-value">{meeting.meetingCode}</p>
                      </div>

                      <div className="meeting-detail">
                        <label className="detail-label">Date</label>
                        <p className="detail-value">{formatDate(meeting.date)}</p>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="join-btn"
                        onClick={() => handleJoinMeeting(meeting.meetingCode)}
                      >
                        Join Meeting
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(meeting.meetingCode);
                          alert('Meeting code copied!');
                        }}
                        title="Copy meeting code"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="history-empty">
              <div className="empty-icon">📋</div>
              <h2>No Meeting History</h2>
              <p>You haven't joined any meetings yet. Start your first call!</p>
              <button
                className="empty-action-btn"
                onClick={() => navigate('/home')}
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
