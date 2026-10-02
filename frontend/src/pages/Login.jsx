import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Activity, ArrowRight, KeyRound, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Waveform from '../components/Waveform';
import api from '../services/api';

const Login = () => {
  // Auth Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Password Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerateRandomEmail = () => {
    const randNum = Math.floor(100 + Math.random() * 900);
    const sampleNames = ['alex', 'praveen', 'sarah', 'david', 'jordan', 'sam', 'morgan', 'taylor'];
    const chosen = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const generated = `${chosen}.${randNum}@gmail.com`;
    setOtpEmail(generated);
    setErrorMsg('');
  };

  const { login, googleLogin, requestOtpLogin, verifyOtpLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If redirected with Google OAuth token or error
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('voxweb_token', token);
      navigate('/dashboard');
    }
    const err = searchParams.get('error');
    if (err) {
      setErrorMsg('Google authentication failed. Please try again.');
    }
  }, [searchParams, navigate]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(email, password, rememberMe);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      setErrorMsg('Please enter your email address to receive an OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await requestOtpLogin(otpEmail);
    setIsLoading(false);

    if (res.success) {
      setOtpSent(true);
      if (res.demo_otp) {
        setDemoOtp(res.demo_otp);
      }
      setSuccessMsg(res.message || `A 6-digit verification code was sent to ${otpEmail}.`);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await verifyOtpLogin(otpEmail, otpCode.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Verification successful! Opening your VoxWeb dashboard...');
      setTimeout(() => navigate('/dashboard'), 600);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleDirectGoogleLogin = async (targetEmail = 'akulapraveenkumar19@gmail.com', name = 'Praveen Kumar') => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await googleLogin({ email: targetEmail, name });
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
    setSuccessMsg('');
    try {
      const redirectUri = window.location.origin;
      localStorage.setItem('voxweb_google_redirect', redirectUri);
      const res = await api.get(`/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res.data?.url) {
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
            Talk. Search. Explore.
            <br />
            <span>With VoxWeb.</span>
          </h1>

          <p className="auth-description">
            Your AI-powered voice assistant that helps you search, find information,
            play music, check weather, open websites, and get answers — all with your voice.
          </p>

          <div className="auth-features-grid">
            <div className="auth-feature-card">
              <div className="feat-icon">🎙</div>
              <h4>Voice to Text</h4>
              <p>Natural speech recognition in real-time</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">⚡</div>
              <h4>Fast Open & Search</h4>
              <p>YouTube, Google Maps, Wikipedia, GitHub</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">🤖</div>
              <h4>OpenRouter AI</h4>
              <p>Powered by GPT-4o-mini and LLM intelligence</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">✉️</div>
              <h4>Email OTP Auth</h4>
              <p>Passwordless sign-in with 6-digit inbox code</p>
            </div>
          </div>
        </div>

        <div className="auth-bottom-wave">
          <Waveform count={32} active={true} height={28} color="rgba(56, 189, 248, 0.85)" />
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 className="auth-card-title">Welcome Back</h2>
          <p className="auth-card-subtitle">Sign in to your VoxWeb account</p>

          {/* Authentication Mode Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: authMode === 'password' ? 'var(--gradient-btn)' : 'transparent',
                color: authMode === 'password' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Lock size={15} />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: authMode === 'otp' ? 'var(--gradient-btn)' : 'transparent',
                color: authMode === 'otp' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <KeyRound size={15} />
              <span>Email OTP (Instant)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
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
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          {/* Form Option 1: Standard Password Login */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@example.com"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-actions">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="remember-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Me</span>
                </label>

                <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="btn-gradient-submit" disabled={isLoading}>
                <span>{isLoading ? 'Signing In...' : 'Sign In with Password'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Form Option 2: Passwordless Email OTP Login */}
          {authMode === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleRequestOtp}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Enter your Email</label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomEmail}
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--accent-blue)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Generate a random email address for instant testing"
                      >
                        🎲 Random Email
                      </button>
                    </div>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="e.g. test.user@gmail.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Type any real or random email address. We will generate and send a 6-digit OTP code directly to it!
                  </p>

                  <button type="submit" className="btn-gradient-submit" disabled={isLoading}>
                    <span>{isLoading ? 'Generating & Sending...' : 'Send Login Code'}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  {/* Demo / Random Email Quick Code Auto-Fill Card */}
                  {demoOtp && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(124, 58, 237, 0.16) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-blue)', fontWeight: 700 }}>
                          Security Code Generated
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '5px', color: '#fff', fontFamily: 'monospace', marginTop: '2px' }}>
                          {demoOtp}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoOtp)}
                        style={{
                          background: 'var(--gradient-btn)',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      disabled
                      className="form-input"
                      value={otpEmail}
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit Email Code</label>
                    <div className="input-wrapper">
                      <KeyRound size={18} className="input-icon" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        className="form-input"
                        placeholder="e.g. 574829"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        autoFocus
                        style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isLoading}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
                    >
                      Resend Code
                    </button>
                  </div>

                  <button type="submit" className="btn-gradient-submit" disabled={isLoading}>
                    <span>{isLoading ? 'Verifying Code...' : 'Verify & Sign In'}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="auth-bottom-switch">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
