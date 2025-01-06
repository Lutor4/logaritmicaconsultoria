import { supabase } from '../lib/api/supabase';
import { withRetry } from '../lib/api/retry';
import type { FormTemplate, FormQuestion, FormResponse } from '../types/forms';

export const formService = {
  async listTemplates() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data: profileData, error: profileError } = await withRetry(() =>
        supabase
          .from('profiles')
          .select('role, department_id')
          .eq('id', userData.user!.id)
          .single()
      );

      if (profileError) throw profileError;

      const query = supabase
        .from('form_templates')
        .select(`
          *,
          department:departments(id, name)
        `);

      // If admin, show all templates
      if (profileData.role === 'admin') {
        query.order('created_at', { ascending: false });
      } else if (profileData.department_id) {
        // If department user, only show templates for their department
        query
          .eq('department_id', profileData.department_id)
          .order('created_at', { ascending: false });
      }

      const { data, error } = await withRetry(() => query);
      if (error) throw error;
      
      return data as FormTemplate[];
    } catch (err) {
      console.error('Error fetching templates:', err);
      throw new Error('Erro ao carregar templates');
    }
  },

  async listQuestions(templateId: string) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('form_questions')
          .select('*')
          .eq('template_id', templateId)
          .order('order_index')
      );

      if (error) throw error;
      return data as FormQuestion[];
    } catch (err) {
      console.error('Error fetching questions:', err);
      throw new Error('Erro ao carregar perguntas');
    }
  },

  async submitResponse(response: Omit<FormResponse, 'id' | 'submitted_at' | 'submitted_by'>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await withRetry(() =>
      supabase
        .from('form_responses')
        .insert([{
          ...response,
          submitted_by: userData.user.id
        }])
        .select()
        .single()
    );

    if (error) throw error;
    return data as FormResponse;
  }
};