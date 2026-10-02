import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const token = searchParams.get('token');

      const finishLogin = (userData) => {
        if (userData) updateUser(userData);
        if (window.opener) {
          window.opener.location.href = '/dashboard';
          window.close();
        } else {
          navigate('/dashboard');
        }
      };

      // If token is already attached in query
      if (token) {
        localStorage.setItem('voxweb_token', token);
        try {
          const res = await api.get('/auth/me');
          finishLogin(res.data);
        } catch (e) {
          finishLogin(null);
        }
        return;
      }

      // If authorization code was returned by Google
      if (code) {
        try {
          // Call backend to exchange code
          const redirectUri = `${window.location.origin}/auth/google/callback`;
          const res = await api.get(
            `/auth/google/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
            {
              headers: { Accept: 'application/json' },
            }
          );

          if (res.data?.access_token) {
            localStorage.setItem('voxweb_token', res.data.access_token);
            finishLogin(res.data.user);
            return;
          }

          // Check if token was set or returned
          const meRes = await api.get('/auth/me');
          if (meRes.data) {
            finishLogin(meRes.data);
            return;
          }
        } catch (err) {
          // If server set cookie or redirected
          const tokenCheck = localStorage.getItem('voxweb_token');
          if (tokenCheck) {
            finishLogin(null);
            return;
          }
          setErrorMsg('Failed to complete Google authentication. Please try again.');
        }
      } else {
        setErrorMsg('No authorization code received.');
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: '#f8fafc',
        fontFamily: 'inherit',
      }}
    >
      {errorMsg ? (
        <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem' }}>
          <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.1rem' }}>{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-gradient-submit"
            style={{ padding: '10px 20px', width: 'auto' }}
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: 'var(--accent-blue)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }}
          />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Authenticating with Google...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Finalizing your secure VoxWeb session
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;
