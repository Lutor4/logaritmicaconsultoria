import { supabase } from '../lib/supabase';

export interface DepartmentImage {
  id: string;
  department_id: string;
  url: string;
  name: string;
  created_at: string;
}

export const imageService = {
  async upload(departmentId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${departmentId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('department-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: imageData, error: insertError } = await supabase
      .from('department_images')
      .insert([
        {
          department_id: departmentId,
          url: filePath,
          name: file.name,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return imageData as DepartmentImage;
  },

  async list(departmentId: string) {
    const { data, error } = await supabase
      .from('department_images')
      .select('*')
      .eq('department_id', departmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DepartmentImage[];
  },

  getPublicUrl(path: string) {
    const { data } = supabase.storage
      .from('department-images')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};