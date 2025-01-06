import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/api/supabase';
import { AUTH_ERROR_MESSAGES } from '../lib/api/errors';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();
        
        // Map specific error messages
        if (errorMessage.includes('invalid login credentials')) {
          return { error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS };
        }
        
        if (errorMessage.includes('database error')) {
          return { error: AUTH_ERROR_MESSAGES.DATABASE_ERROR };
        }

        return { error: AUTH_ERROR_MESSAGES.DEFAULT };
      }

      setUser(data.user);
      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: AUTH_ERROR_MESSAGES.DEFAULT };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signOut
  };
}