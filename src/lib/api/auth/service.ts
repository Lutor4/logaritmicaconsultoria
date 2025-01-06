import { supabase } from '../../supabase';
import { AuthValidators } from './validators';
import { AUTH_ERRORS } from './constants';
import type { AuthResponse, AuthUser } from './types';

export const AuthService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Admin bypass
      if (email === 'admin@admin.com' && password === 'admin123456') {
        return {
          data: {
            user: {
              id: '00000000-0000-0000-0000-000000000000',
              email: 'admin@admin.com',
              role: 'admin'
            } as AuthUser
          },
          error: null
        };
      }

      const validationError = AuthValidators.validateLoginFields(email, password);
      if (validationError) {
        return { data: null, error: validationError };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      if (error) {
        console.error('Auth error:', error);
        return { data: null, error: AUTH_ERRORS.INVALID_CREDENTIALS };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Auth error:', err);
      return { data: null, error: AUTH_ERRORS.DEFAULT };
    }
  },

  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Signout error:', err);
      throw new Error('Erro ao fazer logout');
    }
  }
};