export interface AuthResponse {
  data: any;
  error: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'department';
}