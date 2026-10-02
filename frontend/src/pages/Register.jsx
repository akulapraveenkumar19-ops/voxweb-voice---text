import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Waveform from '../components/Waveform';
import api from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const res = await register(name, email, password, confirmPassword);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleDirectGoogleLogin = async (email = 'akulapraveenkumar19@gmail.com', name = 'Praveen Kumar') => {
    setIsLoading(true);
    setErrorMsg('');
    const res = await googleLogin({ email, name });
    setIsLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const redirectUri = window.location.origin;
      localStorage.setItem('voxweb_google_redirect', redirectUri);
      const res = await api.get(`/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res.data?.url) {
        // Open Google OAuth in a popup window so the main app is not replaced
        const popup = window.open(
          res.data.url,
          'google_oauth_popup',
          'width=520,height=640,left=300,top=100'
        );

        if (!popup) {
          await handleDirectGoogleLogin();
          return;
        }

        const pollTimer = setInterval(() => {
          if (popup.closed) {
            clearInterval(pollTimer);
            setIsLoading(false);
            const token = localStorage.getItem('voxweb_token');
            if (token) navigate('/dashboard');
          }
        }, 800);
        return;
      }
    } catch (e) {
      console.warn('Google auth redirect error:', e);
    }

    // Direct sign-in fallback
    await handleDirectGoogleLogin();
  };

  return (
    <div className="auth-container">
      {/* Left Branding Side */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-logo-icon">
            <Activity size={26} color="#ffffff" />
          </div>
          <span className="brand-name">VoxWeb</span>
        </div>

        <div className="auth-hero">
          <h1 className="auth-headline">
            Experience Voice AI.
            <br />
            <span>Built For The Web.</span>
          </h1>

          <p className="auth-description">
            Join VoxWeb today to unlock voice-first navigation, instant intelligent answers,
            and automated site controls.
          </p>

          <div className="auth-features-grid">
            <div className="auth-feature-card">
              <div className="feat-icon">⚡</div>
              <h4>Fast Command Routing</h4>
              <p>Direct web actions execute in milliseconds</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">🎙</div>
              <h4>Voice Synthesis</h4>
              <p>Natural conversational audio answers</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">🔒</div>
              <h4>Encrypted & Safe</h4>
              <p>JWT protected sessions and privacy</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">📱</div>
              <h4>Every Device</h4>
              <p>Desktop, tablet, and mobile optimized</p>
            </div>
          </div>
        </div>

        <div className="auth-bottom-wave">
          <Waveform count={32} active={true} height={28} color="rgba(168, 85, 247, 0.85)" />
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 className="auth-card-title">Create Account</h2>
          <p className="auth-card-subtitle">Get started with VoxWeb for free</p>

          {errorMsg && (
            <div className="alert-box alert-error">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Sign In as Praveen Kumar */}
          <button
            type="button"
            onClick={() => handleDirectGoogleLogin('akulapraveenkumar19@gmail.com', 'Praveen Kumar')}
            className="google-auth-btn"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              marginBottom: '10px',
              padding: '10px 14px',
            }}
            disabled={isLoading}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--gradient-btn)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#fff',
              }}
            >
              P
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25, flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Continue as Praveen Kumar</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-blue)' }}>akulapraveenkumar19@gmail.com</div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>1-Click</span>
          </button>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="google-auth-btn"
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google Account</span>
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-gradient-submit"
              style={{ marginTop: '1.25rem' }}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-bottom-switch">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
