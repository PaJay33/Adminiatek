import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backendiat.onrender.com/api/auth';

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          setUser(response.data.data);
          setToken(savedToken);
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      const { token: newToken, data: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);

      return { success: true, message: 'Connexion réussie' };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      return { success: false, message };
    }
  };

  // Register
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      });

      const { token: newToken, data: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);

      return { success: true, message: 'Inscription réussie' };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
