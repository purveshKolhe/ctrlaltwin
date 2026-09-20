import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getSignedInUser, initAuth } from '../lib/authService';
import { Hub } from 'aws-amplify/utils';

interface User {
  username?: string;
  displayName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isRedirect = window.location.search.includes('code=') || window.location.search.includes('error=');
  const [loading, setLoading] = useState(true); // Start loading true by default to avoid flashing Login

  const checkAuth = async () => {
    try {
      const currentUser = await getSignedInUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const cancelHub = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          // Redirect successful, Amplify exchanged the code
          checkAuth();
          break;
        case 'signInWithRedirect_failure':
          // Redirect failed, Amplify handled the error
          setLoading(false);
          break;
      }
    });

    if (isRedirect) {
      // Bounded fallback: if Hub event doesn't fire in 10s, release loading lock
      const timer = setTimeout(() => {
        setLoading(false);
      }, 10000);
      return () => {
        cancelHub();
        clearTimeout(timer);
      };
    } else {
      // Not a redirect, check auth normally
      checkAuth();
      return () => cancelHub();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth }}>
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
