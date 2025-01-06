import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  name: string;
  department_id: string;
  municipality_id: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export const projectService = {
  async list() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('municipality_id', userData.user.id)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(project: Partial<Project>) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, municipality_id: userData.user.id }])
      .select();
    
    if (error) throw error;
    return data[0] as Project;
  },
};