import { supabase } from '../lib/supabase';

export interface Employee {
  id: string;
  full_name: string;
  department_id: string;
  position: string;
  created_at: string;
  department?: {
    name: string;
  };
}

export const employeeService = {
  async list() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Erro ao carregar perfil');
    }

    const query = supabase
      .from('employees')
      .select(`
        *,
        department:departments(name)
      `);

    // Se for admin, mostra todos os funcionários dos departamentos do município
    if (profileData.role === 'admin') {
      query.eq('department_id', profileData.department_id);
    } else {
      // Se for departamento, mostra apenas os funcionários do departamento
      query.eq('department_id', profileData.department_id);
    }

    const { data, error } = await query.order('full_name');
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Erro ao carregar funcionários');
    }

    return data || [];
  },

  async create(employee: Partial<Employee>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
      .from('employees')
      .insert([{
        ...employee,
        department_id: profileData.role === 'department' ? profileData.department_id : employee.department_id,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating employee:', error);
      throw new Error('Erro ao criar funcionário');
    }

    return data as Employee;
  },
};