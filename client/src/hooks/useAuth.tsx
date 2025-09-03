import React, { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { apiClient } from "@/lib/supabase";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void; // Replit Auth handles sign in via server redirect
  signUp: () => void; // Same as signIn for Replit Auth
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.get('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    // Redirect to Replit Auth login
    window.location.href = '/api/login';
  };

  const signUp = () => {
    // For Replit Auth, signup and signin are the same
    signIn();
  };

  const signOut = () => {
    // Redirect to Replit Auth logout
    window.location.href = '/api/logout';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}