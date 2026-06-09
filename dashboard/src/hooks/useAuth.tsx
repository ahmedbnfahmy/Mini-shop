import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearStoredAuth() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isInitializing, setIsInitializing] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      navigate('/login');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [navigate]);

  useEffect(() => {
    async function validateSession() {
      const savedToken = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');

      if (!savedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const data = await authService.getProfile();
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;

        if (data.user.role !== 'admin') {
          clearStoredAuth();
          setUser(null);
          setToken(null);
          return;
        }

        setUser({
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
          email: parsedUser?.email ?? '',
        });
        setToken(savedToken);
      } catch {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setIsInitializing(false);
      }
    }

    validateSession();
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    localStorage.setItem('admin_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isInitializing,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
