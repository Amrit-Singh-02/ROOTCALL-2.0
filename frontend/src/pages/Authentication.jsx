import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/authentication.style.css';

export default function Authentication() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState();
  const [formState, setFormState] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Try to use AuthContext if available, otherwise provide fallback
  let handleRegister, handleLogin;
  try {
    const context = useContext(require('../contexts/AuthContext').AuthContext);
    handleRegister = context?.handleRegister;
    handleLogin = context?.handleLogin;
  } catch (e) {
    // Fallback if AuthContext is not available
    console.warn('AuthContext not found, using fallback');
  }

  // RANDOM BACKGROUND IMAGE - Using Lorem Picsum
  const [backgroundImage] = useState(() => {
    const randomSeed = Math.random().toString(36).substring(7);
    const imageUrl = `https://picsum.photos/seed/${randomSeed}/1920/1080`;
    return imageUrl;
  });

  // Validate form inputs
  const validateForm = () => {
    const newErrors = [];

    if (formState === 1) {
      // Sign Up validation
      if (!name || name.trim().length < 3) {
        newErrors.push("Name must be at least 3 characters long");
      }
      if (!username || username.trim().length < 3) {
        newErrors.push("Username must be at least 3 characters long");
      }
      if (!password || password.length < 8) {
        newErrors.push("Password must be at least 8 characters long");
      }
      if (!/^[a-zA-Z0-9]{8,}$/.test(password)) {
        newErrors.push("Password must contain only letters and numbers");
      }
    } else {
      // Sign In validation
      if (!username || username.trim().length < 3) {
        newErrors.push("Username must be at least 3 characters long");
      }
      if (!password || password.length < 8) {
        newErrors.push("Password must be at least 8 characters long");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  let handleAuth = async () => {
    try {
      setLoading(true);
      setErrors([]);

      // Validate before sending
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      if (formState === 0) {
        // Sign In
        if (handleLogin) {
          let result = await handleLogin(username, password);
          if (result) {
            setErrors([]);
          }
        } else {
          console.log("Login attempt:", { username, password });
          setMessage("Login functionality not configured");
          setOpen(true);
        }
      }
      if (formState === 1) {
        // Sign Up
        if (handleRegister) {
          let result = await handleRegister(name, username, password);
          setUsername("");
          setMessage(result);
          setOpen(true);
          setErrors([]);
          setFormState(0);
          setPassword("");
          setName("");
        } else {
          console.log("Signup attempt:", { name, username, password });
          setMessage("Registration functionality not configured");
          setOpen(true);
        }
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-background"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      {/* GLASSMORPHIC FORM CARD */}
      <div className="auth-glass-card">
        <div className="auth-card-content">
          {/* Logo - clickable to navigate to home "/" */}
          <div
            className="auth-logo"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/');
              }
            }}
          >
            <svg width="200" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="30" y="32" fontFamily="Arial, sans-serif" fontSize="25" fontWeight="800" fill="#1F2937">
                ROOTCALL
              </text>
            </svg>
          </div>

          {/* Lock Icon in Circle */}
          <div className="auth-lock-icon">
            <Lock size={24} color="white" />
          </div>

          {/* Sign In / Sign Up Toggle Buttons */}
          <div className="auth-toggle-buttons">
            <button
              className={`auth-toggle-btn ${formState === 0 ? "active" : ""}`}
              onClick={() => {
                setFormState(0);
                setErrors([]);
                setName("");
                setShowPassword(false);
              }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-toggle-btn ${formState === 1 ? "active" : ""}`}
              onClick={() => {
                setFormState(1);
                setErrors([]);
                setShowPassword(false);
              }}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Form Fields */}
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
            {/* Full Name field - only shows during Sign Up (formState === 1) */}
            {formState === 1 && (
              <div className="auth-form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  id="fullname"
                  name="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`auth-input ${errors.some(e => e.includes("Name")) ? "error" : ""}`}
                  required={formState === 1}
                  autoFocus
                />
              </div>
            )}

            {/* Username field */}
            <div className="auth-form-group">
              <input
                type="text"
                placeholder="Username"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`auth-input ${errors.some(e => e.includes("Username")) ? "error" : ""}`}
                required
                autoFocus={formState === 0}
              />
            </div>

            {/* Password field with toggle visibility */}
            <div className="auth-form-group">
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`auth-input auth-password-input ${errors.some(e => e.includes("Password")) ? "error" : ""}`}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Messages as Bullet Points */}
            {errors.length > 0 && (
              <div className="auth-error-box">
                <ul className="auth-error-list">
                  {errors.map((error, index) => (
                    <li key={index} className="auth-error-item">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Login/Register Button */}
            <button
              type="button"
              className="auth-submit-btn"
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? "Loading..." : formState === 0 ? "LOGIN" : "REGISTER"}
            </button>
          </form>
        </div>
      </div>

      {/* Success message snackbar - shows after successful registration */}
      {open && (
        <div className="auth-snackbar">
          <div className="auth-snackbar-content">
            {message}
          </div>
          <button
            className="auth-snackbar-close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}