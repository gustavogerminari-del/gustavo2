/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, UserRole } from '../types_master';
import { firebaseService } from '../firebase';

interface AuthContextType {
  currentUser: UserAccount | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<UserAccount>;
  signUp: (email: string, name: string, role: UserRole, companyId?: string, employeeId?: string, password?: string) => Promise<UserAccount>;
  logout: () => Promise<void>;
  setCurrentUser: (user: UserAccount | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore isolated user session for this device/tab
    try {
      const user = firebaseService.auth.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.error('Error restoring auth session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<UserAccount> => {
    const user = await firebaseService.auth.signIn(email, password);
    setCurrentUser(user);
    return user;
  };

  const signUp = async (
    email: string,
    name: string,
    role: UserRole,
    companyId?: string,
    employeeId?: string,
    password?: string
  ): Promise<UserAccount> => {
    const user = await firebaseService.auth.signUp(email, name, role, companyId, employeeId, password);
    setCurrentUser(user);
    return user;
  };

  const logout = async (): Promise<void> => {
    await firebaseService.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signUp,
        logout,
        setCurrentUser
      }}
    >
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
