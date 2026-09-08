import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('wedamate_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem('wedamate_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    showToast(`Account created successfully! Welcome to WedaMate.`, 'success');
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const isCustomer = user?.role === 'customer';
  const isProvider = user?.role === 'provider';
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isCustomer,
        isProvider,
        isDriver,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        refreshUser: loadUser
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
