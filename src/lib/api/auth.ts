import { supabase } from '../supabase';
import { getAuthErrorMessage } from './errors';
import { AuthValidators } from './validators';

export const AuthAPI = {
  async signIn(email: string, password: string) {
    try {
      const validationError = AuthValidators.validateLoginFields(email, password);
      if (validationError) {
        return { error: validationError };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      if (error) {
        console.error('Auth error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      // Verify profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return { error: 'Erro ao carregar perfil' };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Auth error:', err);
      return { error: getAuthErrorMessage(err) };
    }
  },

  async signUp(email: string, password: string) {
    try {
      const validationError = AuthValidators.validateLoginFields(email, password);
      if (validationError) {
        return { error: validationError };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        options: {
          data: {
            role: 'department'
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error: getAuthErrorMessage(error) };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Auth error:', err);
      return { error: getAuthErrorMessage(err) };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Signout error:', err);
      throw new Error('Erro ao fazer logout');
    }
  }
};