import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DISABLED AUTO-LOGIN: Always start logged out for testing
    // Uncomment the code below to enable auto-login
    /*
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that the stored user has required fields
        if (parsedUser && (parsedUser.userId || parsedUser.id)) {
          setUser(parsedUser);
        } else {
          // Invalid user data, remove it
          console.warn('Invalid user data in storage, clearing...');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    */
    // Always start logged out
    localStorage.removeItem('currentUser');
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    // Clear localStorage first
    localStorage.removeItem('currentUser');
    // Then clear state
    setUser(null);
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const getCurrentUserId = () => {
    // Only use the current user state, don't fallback to localStorage
    // This prevents using stale data
    if (user && (user.userId || user.id)) {
      return user.userId || user.id || null;
    }
    return null;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    getCurrentUserId,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

