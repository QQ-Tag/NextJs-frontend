'use client';

import type { AuthUser } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  signup: (userData: { name: string; email: string; password: string; phone?: string; whatsapp?: string }) => Promise<AuthUser | null>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  googleLogin: (googleToken: string) => Promise<AuthUser | null>;
  updateCurrentUser: (updatedUser: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to get redirect URL from browser
  const getRedirectUrl = (): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('redirect');
    }
    return null;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('currentUser');
    const storedIsAdmin = localStorage.getItem('isAdmin');
    
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    if (storedIsAdmin) {
      setIsAdmin(JSON.parse(storedIsAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { access_token, user } = data;

      // Store uniqueId from redirect query parameter
      const redirectUrl = getRedirectUrl();
      if (redirectUrl && redirectUrl.startsWith('/qr/')) {
        const uniqueId = redirectUrl.split('/qr/')[1];
        if (uniqueId) {
          localStorage.setItem('pendingQrRedirect', uniqueId);
        }
      }

      setToken(access_token);
      setCurrentUser(user);
      setIsAdmin(false);
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Redirect to QR code page if present, else dashboard
      router.push(redirectUrl || '/dashboard');
      
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: { name: string; email: string; password: string; phone?: string; whatsapp?: string }): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      const { access_token, user } = data;

      // Store uniqueId from redirect query parameter
      const redirectUrl = getRedirectUrl();
      if (redirectUrl && redirectUrl.startsWith('/qr/')) {
        const uniqueId = redirectUrl.split('/qr/')[1];
        if (uniqueId) {
          localStorage.setItem('pendingQrRedirect', uniqueId);
        }
      }

      setToken(access_token);
      setCurrentUser(user);
      setIsAdmin(false);
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Redirect to QR code page if present, else dashboard
      router.push(redirectUrl || '/dashboard');
      
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Admin login failed');
      }

      const data = await response.json();
      const { access_token } = data;

      setToken(access_token);
      setCurrentUser(null);
      setIsAdmin(true);
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.removeItem('currentUser');
      
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleToken: string): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Google login failed');
      }

      const data = await response.json();
      const { access_token, user } = data;

      // Store uniqueId from redirect query parameter
      const redirectUrl = getRedirectUrl();
      if (redirectUrl && redirectUrl.startsWith('/qr/')) {
        const uniqueId = redirectUrl.split('/qr/')[1];
        if (uniqueId) {
          localStorage.setItem('pendingQrRedirect', uniqueId);
        }
      }

      setToken(access_token);
      setCurrentUser(user);
      setIsAdmin(false);
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Redirect to QR code page if present, else dashboard
      router.push(redirectUrl || '/dashboard');
      
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('pendingQrRedirect');
    router.push('/');
  };

  // Updated updateCurrentUser function that calls backend API
  const updateCurrentUser = async (updatedFields: Partial<AuthUser>): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...updatedFields
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedUser = data.user;

      // Update local state and localStorage with the response from backend
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      loading, 
      token,
      login, 
      signup, 
      logout, 
      adminLogin, 
      googleLogin,
      updateCurrentUser 
    }}>
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