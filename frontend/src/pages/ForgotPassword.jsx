import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Waveform from '../components/Waveform';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [demoOtp, setDemoOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleGenerateRandomEmail = () => {
    const randNum = Math.floor(100 + Math.random() * 900);
    const sampleNames = ['alex', 'praveen', 'sarah', 'david', 'jordan', 'sam'];
    const chosen = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    setEmail(`${chosen}.${randNum}@gmail.com`);
    setErrorMsg('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data?.demo_otp) {
        setDemoOtp(res.data.demo_otp);
      }
      setSuccessMsg(res.data.message || 'An OTP verification code has been sent to your email address.');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to send OTP. Please check the email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            Secure Account
            <br />
            <span>Recovery.</span>
          </h1>

          <p className="auth-description">
            Safely reset your VoxWeb password with encrypted email verification codes.
            Your privacy and security are our highest priority.
          </p>

          <div className="auth-features-grid">
            <div className="auth-feature-card">
              <div className="feat-icon">🔑</div>
              <h4>One-Time Passcode</h4>
              <p>Time-limited, single-use security token</p>
            </div>
            <div className="auth-feature-card">
              <div className="feat-icon">🛡️</div>
              <h4>Bcrypt Hashing</h4>
              <p>Passwords are never stored in plaintext</p>
            </div>
          </div>
        </div>

        <div className="auth-bottom-wave">
          <Waveform count={32} active={true} height={28} color="rgba(56, 189, 248, 0.85)" />
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 className="auth-card-title">Forgot Password?</h2>
          <p className="auth-card-subtitle">
            {step === 1
              ? "Enter your email address and we'll send you an OTP to reset your password."
              : 'Enter the verification OTP and choose a new password.'}
          </p>

          {errorMsg && (
            <div className="alert-box alert-error">
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Email Address</label>
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
                    placeholder="Enter your registered or random email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-gradient-submit"
                style={{ marginTop: '1.5rem' }}
                disabled={isLoading}
              >
                <span>{isLoading ? 'Generating & Sending...' : 'Send Verification OTP'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
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
                    onClick={() => setOtp(demoOtp)}
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
                <label className="form-label">Enter 6-Digit OTP</label>
                <div className="input-wrapper">
                  <KeyRound size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-gradient-submit"
                style={{ marginTop: '1.5rem' }}
                disabled={isLoading}
              >
                <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'transparent', color: 'var(--text-dim)', fontSize: '0.85rem' }}
                >
                  Resend OTP / Change Email
                </button>
              </div>
            </form>
          )}

          <div className="auth-bottom-switch">
            Remembered your password?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
