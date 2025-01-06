import { supabase } from '../lib/supabase';

export interface Department {
  id: string;
  name: string;
  budget: number;
  municipality_id: string;
  user_id: string;
  created_at: string;
}

export const departmentService = {
  async list() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Admin bypass - show all departments
      if (userData.user.email === 'admin@admin.com') {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data as Department[];
      }

      // For regular users, show only their department
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('name');

      if (error) throw error;
      return data as Department[];
    } catch (err) {
      console.error('Error fetching departments:', err);
      throw new Error('Erro ao carregar departamentos');
    }
  },

  async create(department: Partial<Department>) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('departments')
        .insert([{
          ...department,
          municipality_id: userData.user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Department;
    } catch (err) {
      console.error('Error creating department:', err);
      throw new Error('Erro ao criar departamento');
    }
  }
};