import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bb_user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('bb_token')));

  // Re-validate the session on load (persistent auth)
  useEffect(() => {
    if (!localStorage.getItem('bb_token')) return;
    authService
      .me()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('bb_user', JSON.stringify(data.user));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSession = useCallback((data) => {
    localStorage.setItem('bb_token', data.token);
    localStorage.setItem('bb_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    saveSession(data);
    return data.user;
  }, [saveSession]);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    saveSession(data);
    return data.user;
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('bb_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
