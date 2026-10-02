import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('voxweb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('voxweb_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check auth session on initial load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('voxweb_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // If expired or unauthorized, reset
        if (err.response?.status === 401) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('voxweb_user');
          localStorage.removeItem('voxweb_token');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const saveAuthSession = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('voxweb_token', authToken);
    localStorage.setItem('voxweb_user', JSON.stringify(userData));
  };

  const login = async (email, password, rememberMe = true) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        remember_me: rememberMe,
      });
      const { access_token, user: userData } = res.data;
      saveAuthSession(access_token, userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      const { access_token, user: userData } = res.data;
      saveAuthSession(access_token, userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const requestOtpLogin = async (email) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/otp-login-request', { email });
      return {
        success: true,
        message: res.data?.message || 'Verification code sent.',
        demo_otp: res.data?.demo_otp
      };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send verification code. Please check your email.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const verifyOtpLogin = async (email, otp, name = '') => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/otp-login-verify', { email, otp, name });
      const { access_token, user: userData } = res.data;
      saveAuthSession(access_token, userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired OTP code.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const googleLogin = async (payload = {}) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/google', payload);
      const { access_token, user: userData } = res.data;
      saveAuthSession(access_token, userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Google sign-in failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('voxweb_token');
    localStorage.removeItem('voxweb_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('voxweb_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        register,
        requestOtpLogin,
        verifyOtpLogin,
        googleLogin,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
