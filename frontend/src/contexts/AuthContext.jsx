import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshIntervalRef = useRef(null);
  const authCheckRef = useRef(false);
  const mountedRef = useRef(true);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckRef.current || !mountedRef.current) return;
    authCheckRef.current = true;
    console.log('🔍 Checking auth status...');
    
    try {
      const response = await authAPI.getProfile();
      if (response.data.user && mountedRef.current) {
        console.log('✅ User authenticated:', response.data.user.username);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Auth check failed - user is not authenticated (this is normal)
      console.log('ℹ️ User not authenticated (normal for login page)');
      if (mountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      authCheckRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only check auth status if we're not on the login page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      checkAuthStatus();
    } else {
      // On login page, just set loading to false
      setLoading(false);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && !refreshIntervalRef.current) {
      console.log('✅ Setting up token refresh (10 minutes)');
      refreshIntervalRef.current = setInterval(async () => {
        try {
          await authAPI.refreshToken();
          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.log('❌ Token refresh failed:', error.response?.status);
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
        }
      }, 10 * 60 * 1000);
    } else if (!isAuthenticated && refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, logout]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
