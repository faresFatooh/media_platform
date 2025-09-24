import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { getCurrentUser } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // ✅ Security: Only accept messages from your main dashboard
      if (event.origin !== "https://ghazimortaja.com") { 
        return;
      }

      if (event.data && event.data.type === 'AUTH_TOKEN') {
        const receivedToken = event.data.token;
        if (receivedToken) {
          try {
            const userData = await getCurrentUser(receivedToken);
            setUser(userData);
            setToken(receivedToken);
            localStorage.setItem('access_token', receivedToken);
          } catch (error) {
            console.error("Authentication failed with received token:", error);
            logout();
          } finally {
            setIsLoading(false);
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000); 

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};