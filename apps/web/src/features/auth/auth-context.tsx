'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, authenticatedApiClient, SESSION_EXPIRED_EVENT, setAccessToken } from '@/services/api-client';
import type { AuthResponse, AuthUser } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  acceptSession: (session: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  const acceptSession = useCallback((session: AuthResponse) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => setUser(nextUser), []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiClient<AuthResponse>('/auth/refresh', { method: 'POST' })
      .then((session) => {
        if (active) acceptSession(session);
      })
      .catch(() => {
        if (active) {
          setAccessToken(null);
          setStatus('unauthenticated');
        }
      });
    return () => {
      active = false;
    };
  }, [acceptSession]);

  useEffect(() => { const expired = () => { setAccessToken(null); setUser(null); setStatus('unauthenticated'); }; window.addEventListener(SESSION_EXPIRED_EVENT, expired); return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expired); }, []);

  const value = useMemo(
    () => ({ user, status, acceptSession, updateUser, logout }),
    [user, status, acceptSession, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export async function loadCurrentUser() {
  return authenticatedApiClient<{ user: AuthUser }>('/auth/me');
}
