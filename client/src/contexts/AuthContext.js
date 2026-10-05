import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const getErrorMessage = (err, fallback) => {
  if (err.response?.data) {
    if (typeof err.response.data === 'string') return err.response.data;
    if (err.response.data.msg) return err.response.data.msg;
    if (err.response.data.message) return err.response.data.message;
    if (err.response.data.error) return err.response.data.error;
  }
  return err.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getProfile();
          setUser(userData);
        }
      } catch (err) {
        // If token is invalid, remove it
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user } = await authService.login(credentials);
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Login failed') };
    }
  };

  const register = async (userData) => {
    try {
      const { token, user } = await authService.register(userData);
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Registration failed') };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Update failed') };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};