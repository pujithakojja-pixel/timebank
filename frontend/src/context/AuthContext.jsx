import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Restore session on mount ── */
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('tb_token');
      if (!savedToken) { setLoading(false); return; }

      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          setUser(data.user);
          setToken(savedToken);
        } else {
          clearStorage();
        }
      } catch {
        clearStorage();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();

    // Force logout from any tab
    const onStorageChange = (e) => {
      if (e.key === 'tb_token' && !e.newValue) {
        setUser(null); setToken(null);
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('tb_token');
    localStorage.removeItem('tb_user');
  };

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (!data.success) throw new Error(data.message || 'Login failed');
    localStorage.setItem('tb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  /* ── Register ── */
  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    if (!data.success) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('tb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  /* ── Update user in state ── */
  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  /* ── Refresh user from server ── */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.success) setUser(data.user);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
