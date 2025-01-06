import { supabase } from './supabase';

export const AuthService = {
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error signing out:', err);
      throw new Error('Erro ao fazer logout');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err) {
      console.error('Error getting current user:', err);
      return null;
    }
  }
};