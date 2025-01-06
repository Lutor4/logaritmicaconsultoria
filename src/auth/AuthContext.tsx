import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../lib/api/auth/service';
import type { AuthUser } from '../lib/api/auth/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await AuthService.signIn(email, password);
      
      if (error) {
        setError(error);
        return { error };
      }

      setUser(data.user);
      return { error: null };
    } catch (err) {
      const message = 'Erro ao fazer login. Tente novamente.';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Signout error:', err);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}