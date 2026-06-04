import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getToken, removeToken } from '@/storage/authStorage';

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

let logoutListener: (() => void) | null = null;

export const setOn401Unauthorized = (callback: () => void) => {
  logoutListener = callback;
};

export const handle401Unauthorized = () => {
  if (logoutListener) {
    logoutListener();
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getToken().then((storedToken) => {
      setToken(storedToken);
      setIsLoading(false);
    });

    setOn401Unauthorized(async () => {
      await removeToken();
      setToken(null);
    });

    return () => {
      setOn401Unauthorized(() => {});
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
