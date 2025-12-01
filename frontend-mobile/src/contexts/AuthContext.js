import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // DISABLED AUTO-LOGIN: Always start logged out for testing
      // Uncomment the code below to enable auto-login
      /*
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate that the stored user has required fields
          if (parsedUser && (parsedUser.userId || parsedUser.id)) {
            setUser(parsedUser);
          } else {
            // Invalid user data, remove it
            console.warn('Invalid user data in storage, clearing...');
            await AsyncStorage.removeItem('currentUser');
          }
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          await AsyncStorage.removeItem('currentUser');
        }
      }
      */
      // Always start logged out
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear potentially corrupted data
      await AsyncStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear state even if storage fails
      setUser(null);
    }
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const getCurrentUserId = () => {
    if (user) {
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

