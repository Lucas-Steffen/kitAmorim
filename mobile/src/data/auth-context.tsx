import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { login as loginService } from '@/services/auth.service';

type AuthState = {
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, isLoading: false, error: null });

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { token } = await loginService(email, password);
      setState({ token, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer login';
      setState({ token: null, isLoading: false, error: message });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, isLoading: false, error: null });
  }, []);

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
