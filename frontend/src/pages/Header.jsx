import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <nav className="nav">
        <a href="/" className="logo">Root Call</a>

        

        <div className="nav-buttons">
          <button className="nav-signin" onClick={() => navigate('/home')}>Sign In</button>
          <button className="nav-signup" onClick={() => navigate('/home')}>Sign Up Free</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;