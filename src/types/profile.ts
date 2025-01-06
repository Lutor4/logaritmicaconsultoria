export interface Profile {
  id: string;
  email: string;
  full_name: string;
  municipality: string;
  role: 'admin' | 'department';
  department_id?: string;
  department?: {
    id: string;
    name: string;
  };
}