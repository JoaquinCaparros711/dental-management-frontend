import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getToken, removeToken } from '@/storage/authStorage';
import { onUnauthorized } from '@/api/apiClient';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    getToken().then((storedToken) => {
      if (isMounted) {
        setToken(storedToken);
        setIsLoading(false);
      }
    });

    const unsubscribe = onUnauthorized(async () => {
      await removeToken();
      if (isMounted) {
        setToken(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth(): AuthContextType {
  return useContext(AuthContext);
}

