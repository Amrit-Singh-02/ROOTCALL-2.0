import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Video, Users, Share2, Lock, Zap, BarChart3 } from 'lucide-react';
import Header from './Header';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'AI Companion',
      description: 'Smart assistant that helps you work faster and smarter',
      badge: 'AI Powered',
    },
    {
      icon: Video,
      title: 'Video Meetings',
      description: 'Crystal clear HD video and audio for seamless communication',
      badge: 'Crystal Clear',
    },
    {
      icon: Users,
      title: 'Team Chat',
      description: 'Stay connected with instant messaging and file sharing',
      badge: 'Instant Messaging',
    },
    {
      icon: Share2,
      title: 'Screen Share',
      description: 'Present and collaborate with screen sharing capabilities',
      badge: 'Live Sharing',
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'End-to-end encryption for your peace of mind',
      badge: 'Enterprise Grade',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Insights and metrics to track your communication',
      badge: 'Data Insights',
    },
  ];

  const recognitions = [
    {
      title: 'Leader in Video Conferencing',
      subtitle: 'Root Call Recognized in the 2025 Leaders List',
      description: 'Named a leader in video conferencing worldwide 2025',
      link: 'Read the report',
    },
    {
      title: 'Enterprise Solution',
      subtitle: 'Root Call recognized in the 2025 Enterprise List',
      description: 'Trusted by enterprises worldwide for their communication needs',
      link: 'Explore the report',
    },
    {
      title: 'Industry Standard',
      subtitle: 'Root Call named a leader in The Industry Wave 2025',
      description: 'Setting new standards for unified communications',
      link: 'Read report',
    },
  ];

  return (


    <div className="landing-page">

    <Header/>

      {/* Animated Liquid Background */}
      <div className="liquid-background">
        <div className="liquid-flow"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find out what's possible<br />when work connects
            </h1>
            <p className="hero-subtitle">
              Whether you're chatting with teammates or supporting customers, Root Call makes it easier to connect, collaborate, and reach goals — all with built-in AI doing the heavy lifting.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/home')}>
                Get Started <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/4dgd81c9e')}>
                Join as Guest
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Powerful Features</h2>
          <div className="features-grid">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="feature-card">
                  <div className="feature-header">
                    <Icon className="feature-icon" />
                    <span className="feature-badge">{feature.badge}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="recognition-section">
        <div className="section-container">
          <h2 className="section-title">Recognized as a Leader</h2>
          <div className="recognition-grid">
            {recognitions.map((recognition, idx) => (
              <div key={idx} className="recognition-card">
                <h3 className="recognition-title">{recognition.title}</h3>
                <h4 className="recognition-subtitle">{recognition.subtitle}</h4>
                <p className="recognition-description">{recognition.description}</p>
                <button className="recognition-link">
                  {recognition.link} <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">Join millions of users connecting on Root Call every day</p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/auth')}>Sign Up Free</button>
            <button className="btn btn-secondary" onClick={() => navigate('/4dgd81c9e')}>Join as Guest</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#/">Features</a></li>
                <li><a href="#/">Security</a></li>
                <li><a href="#/">Pricing</a></li>
                <li><a href="#/">Updates</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#/">About</a></li>
                <li><a href="#/">Blog</a></li>
                <li><a href="#/">Careers</a></li>
                <li><a href="#/">Press</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#/">Help Center</a></li>
                <li><a href="#/">Community</a></li>
                <li><a href="#/">Contact Sales</a></li>
                <li><a href="#/">Feedback</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#/">Privacy</a></li>
                <li><a href="#/">Terms</a></li>
                <li><a href="#/">Cookie Policy</a></li>
                <li><a href="#/">Accessibility</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Social</h4>
              <ul>
                <li><a href="#/">Twitter</a></li>
                <li><a href="#/">LinkedIn</a></li>
                <li><a href="#/">Facebook</a></li>
                <li><a href="#/">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Root Call Corporation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;